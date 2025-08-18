import { Module, forwardRef } from '@nestjs/common';

// ImportsTypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports rental entity.
import { RentalEntity } from './entities/rental.entity';

// Imports contract entity.
import { ContractEntity } from './entities/contract.entity';

// Imports rental services.
import { CheckAvaliabilityVehicleService } from './services/checkAvaliabilityVehicle.service';
import { CreateNewRentalRecordService } from './services/createNewRentalRecord.service';
import { GetRentalInfoService } from './services/getRentalInfo.service';
import { OwnerDecisionRentalService } from './services/ownerDecisionRental.service';
import { GetCreateSignContractService } from './services/getCreateSignContract.service';
import { ConfirmVehicleService } from './services/confirmVehicle.service';

// Imports rental controllers.
import { NewRentalController } from './controllers/newRental.controller';
import { CheckAvaliabilityVehicleController } from './controllers/checkAvaliabilityVehicle.controller';
import { GetRentalInfoController } from './controllers/getRentalInfo.controller';
import { OwnerDecisionRentalController } from './controllers/ownerDecisionRental.controller';
import { ConfirmRentalController } from './controllers/confirmRental.controller';
import { GetCreateSignContractController } from './controllers/getCreateSignContract.controller';

// Imports rental processor.
import { RentalCancellationProcessor } from './services/processor/rentalCancellation.processor';

// Imports vehicle module and entities.
import { VehicleModule } from '../vehicle/vehicle.module';
import { VehicleEntity } from '../vehicle/entities/vehicle.entity';

// Imports user module and entities.
import { UserModule } from '../user/user.module';
import { UserEntity } from '../user/entities/user.entity';

// Imports socket module.
import { SocketModule } from '../socket/socket.module';

// Imports bull module.
import { BullModule } from '@nestjs/bull';

// Imports auth module.
import { AuthModule } from '../auth/auth.module';

// Imports account level guard.
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'rental-cancel-queue',
        }),
        TypeOrmModule.forFeature([RentalEntity, ContractEntity]),
        forwardRef(() => VehicleModule),
        forwardRef(() => UserModule),
        SocketModule,
        AuthModule
    ],
    controllers: [
        NewRentalController,
        CheckAvaliabilityVehicleController, 
        GetRentalInfoController,
        OwnerDecisionRentalController,
        ConfirmRentalController,
        GetCreateSignContractController
    ],
    providers: [
        CheckAvaliabilityVehicleService, 
        CreateNewRentalRecordService, 
        GetRentalInfoService, 
        OwnerDecisionRentalService,
        GetCreateSignContractService,
        ConfirmVehicleService,
        RentalCancellationProcessor,
        AccountLevelGuard
    ],
    exports: [
        CheckAvaliabilityVehicleService, 
        CreateNewRentalRecordService, 
        GetRentalInfoService, 
        OwnerDecisionRentalService,
        GetCreateSignContractService,
        ConfirmVehicleService
    ]
})
export class RentalModule {}
