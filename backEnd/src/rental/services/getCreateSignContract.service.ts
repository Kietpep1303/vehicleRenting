import { HttpStatus, Injectable } from '@nestjs/common';

// Imports TypeORM.
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

// Imports standard time.
import { generateDate } from '../../common/utils/standardDate.util';

// Imports entities.
import { RentalEntity, RentalStatus } from '../entities/rental.entity';

// Imports contract entity.
import { ContractEntity, ContractStatus } from '../entities/contract.entity';

// Imports socket service.
import { NotificationService } from '../../socket/services/notification.service';

// Imports dto.
import { ContractDto } from '../dto/contract.dto';

// Imports error handler.
import { ErrorHandler } from '../../errorHandler/errorHandler';
import { ErrorCodes } from '../../errorHandler/errorCodes';

// Imports uuid.
import { v7 as uuidv7 } from 'uuid';


@Injectable()
export class GetCreateSignContractService {
    constructor(
        @InjectRepository(RentalEntity) private rentalRepository: Repository<RentalEntity>,
        @InjectRepository(ContractEntity) private contractRepository: Repository<ContractEntity>,
        private notificationService: NotificationService
    ) {}
    
    // Get the prepared contract.
    async getPreparedContract(rentalId: number) {

        // Get all the data needed (vehicle, renter, vehicle owner).
        const rental = await this.rentalRepository.findOne({ 
            where: { id: rentalId },
            relations: ['vehicle', 'vehicleOwner', 'renter']
        });
        if (!rental) throw new ErrorHandler(ErrorCodes.RENTAL_NOT_FOUND, 'Rental not found', HttpStatus.BAD_REQUEST);

        // Get the contract date.
        const currentDate = generateDate();
        const contractDate = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
        }

        // Get the address from the vehicle's location.
        const { city, district, ward, address } = rental.vehicle;
        const contractAddress = {
            city,
            district,
            ward,
            address
        }

        // Get the renter's information.
        const renterName = [rental.renter.firstName, rental.renter.middleName, rental.renter.lastName].filter(Boolean).join(' ');
        const renterInformation = {
            name: renterName,
            phoneNumber: rental.renterPhoneNumber,
            idCardNumber: rental.renter.idCardNumber,
            driverLicenseNumber: rental.renter.driverLicense
        }

        // Get the vehicle owner's information.
        const vehicleOwnerName = [rental.vehicleOwner.firstName, rental.vehicleOwner.middleName, rental.vehicleOwner.lastName].filter(Boolean).join(' ');
        const vehicleOwnerInformation = {
            name: vehicleOwnerName,
            phoneNumber: rental.vehicleOwner.phoneNumber,
            idCardNumber: rental.vehicleOwner.idCardNumber,
        }

        // Get the vehicle's information.
        const vehicleInformation = {
            brand: rental.vehicle.brand,
            model: rental.vehicle.model,
            year: rental.vehicle.year,
            color: rental.vehicle.color,
            vehicleRegistrationId: rental.vehicle.vehicleRegistrationId,
        }
        

        // Get the rental's information.
        const rentalInformation = {
            startDateTime: rental.startDateTime,
            endDateTime: rental.endDateTime,
            totalDays: rental.totalDays,
            totalPrice: rental.totalPrice,
            depositPrice: rental.depositPrice
        }

        // Return the contract.
        return {
            contractDate,
            renterInformation,
            vehicleOwnerInformation,
            vehicleInformation,
            contractAddress,
            rentalInformation,
        }
    }

    // Create the contract.
    async createContract(rentalId: number, contractDto: ContractDto) {
        // Get the rental information.
        const rental = await this.rentalRepository.findOne({ where: { id: rentalId } });
        if (!rental) return null;

        const contract = await this.contractRepository.create({
            id: `[CONTRACT]${uuidv7()}`,
            rentalId: rentalId,
            contractData: contractDto,
            ownerStatus: ContractStatus.PENDING,
            renterStatus: ContractStatus.PENDING,
            contractStatus: ContractStatus.PENDING,
            createdAt: generateDate(),
        });

        // Save the contract.
        const result = await this.contractRepository.save(contract);

        // Update the rental status.
        rental.status = RentalStatus.CONTRACT_PENDING;
        rental.statusWorkflowHistory.push({
            status: `Waiting for the owner and renter to sign the rental contract.`,
            date: generateDate()
        });
        rental.updatedAt = generateDate();
        await this.rentalRepository.save(rental);

        // Notify the renter and vehicle owner.
        this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);
        this.notificationService.notifyOwnerNewRentalUpdate(rental.vehicleOwnerId, rental);

        return result;
    }

    // Get all the contracts from rental ID.
    async getContractsFromRentalId(rentalId: number) {
        const contracts = await this.contractRepository.find({
            where: { rentalId: rentalId }
        });
        return contracts;
    }

    // Get the contract from contract ID.
    async getContractFromContractId(contractId: string) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId }
        });
        return contract;
    }

    // Renter decision to sign the contract.
    async renterDecisionToSignContract(contractId: string, decision: boolean) {

        // Find the contract.
        const contract = await this.contractRepository.findOne({
            where: { id: contractId }
        });
        if (!contract) return null;

        // Get the rental.
        const rental = await this.rentalRepository.findOne({
            where: { id: contract.rentalId }
        });
        if (!rental) return null;

        // Perform the decision.
        if (decision) {
            contract.renterStatus = ContractStatus.SIGNED;
        } else if (!decision) {
            contract.renterStatus = ContractStatus.REJECTED;
            contract.contractStatus = ContractStatus.REJECTED;
        }
        const updatedResult = await this.contractRepository.save(contract);

        // Notify the vehicle owner.
        this.notificationService.notifyOwnerNewRentalUpdate(rental.vehicleOwnerId, rental);

        // Check if both parties have signed the contract.
        if (updatedResult.renterStatus === ContractStatus.SIGNED && updatedResult.ownerStatus === ContractStatus.SIGNED) {
            updatedResult.contractStatus = ContractStatus.SIGNED;
            rental.status = RentalStatus.CONTRACT_SIGNED;
            rental.statusWorkflowHistory.push({
                status: "Contract signed by both renter and vehicle owner.",
                date: generateDate()
            })
            rental.updatedAt = generateDate();
            await this.contractRepository.save(updatedResult);
            await this.rentalRepository.save(rental);

            // Notify both parties.
            this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);
            this.notificationService.notifyOwnerNewRentalUpdate(rental.vehicleOwnerId, rental);
        }

        // Return the updated contract.
        return updatedResult;
    }

    // Vehicle owner decision to sign the contract.
    async vehicleOwnerDecisionToSignContract(contractId: string, decision: boolean) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId }
        });
        if (!contract) return null;

        // Get the rental.
        const rental = await this.rentalRepository.findOne({
            where: { id: contract.rentalId }
        });
        if (!rental) return null;

        // Perform the decision.
        if (decision) {
            contract.ownerStatus = ContractStatus.SIGNED;
        } else if (!decision) {
            contract.ownerStatus = ContractStatus.REJECTED;
            contract.contractStatus = ContractStatus.REJECTED;
        }

        const updatedResult = await this.contractRepository.save(contract);

        // Notify the renter.
        this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);

        // Check if both parties have signed the contract.
        if (updatedResult.renterStatus === ContractStatus.SIGNED && updatedResult.ownerStatus === ContractStatus.SIGNED) {
            updatedResult.contractStatus = ContractStatus.SIGNED;
            rental.status = RentalStatus.CONTRACT_SIGNED;
            rental.statusWorkflowHistory.push({
                status: "Contract signed by both renter and vehicle owner.",
                date: generateDate()
            })
            rental.updatedAt = generateDate();
            await this.contractRepository.save(updatedResult);
            await this.rentalRepository.save(rental);

            // Notify both parties.
            this.notificationService.notifyRenterNewRentalUpdate(rental.renterId, rental);
            this.notificationService.notifyOwnerNewRentalUpdate(rental.vehicleOwnerId, rental);
        }
        // Return the updated contract.
        return updatedResult;
    }
}
    
