import { Module, forwardRef } from '@nestjs/common';

// Imports controllers.
import { VehicleController } from './controllers/vehicle.controller';
import { GetConstantsController } from './controllers/getConstants.controller';
import { UploadVehicleController } from './controllers/uploadVehicle.controller';
import { CreateEditGetRatingController } from './controllers/createEditGetRating.controller';
import { FavoriteVehicleController } from './controllers/favoriteVehicle.controller';

// Imports vehicle services.
import { GetVehicleService } from './services/getVehicle.service';
import { VehicleValidationService } from './services/vehicleValidation.service';
import { CreateUpdateDeleteVehicleService } from './services/createUpdateDeleteVehicle.service';
import { VehicleCleanUpService } from './services/vehicleCleanUp.service';
import { CreateEditRatingService } from './services/createEditRating.service';
import { FavoriteVehicleService } from './services/favoriteVehicle.service';

// Imports vehicle entities.
import { VehicleEntity } from './entities/vehicle.entity';
import { VehicleViewEntity } from './entities/vehicleView.entity';
import { VehicleRatingEntity } from './entities/vehicleRating.entity';
import { VehicleTotalViewEntity } from './entities/vehicleTotalView.entity';
import { VehicleTotalRatingEntity } from './entities/vehicleTotalRating.entity';
import { FavoriteVehicleEntity } from './entities/favoriteVehicle.entity';

// Imports typeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports user module.
import { UserModule } from '../user/user.module';

// Imports cloudinary module.
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

// Imports rental module.
import { RentalModule } from '../rental/rental.module';

// Imports rental entities.
import { RentalEntity } from '../rental/entities/rental.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleEntity, 
      VehicleViewEntity,
      VehicleRatingEntity, 
      VehicleTotalViewEntity, 
      VehicleTotalRatingEntity, 
      RentalEntity,
      FavoriteVehicleEntity]),
    forwardRef(() => UserModule),
    CloudinaryModule,
    forwardRef(() => RentalModule),
  ],
  controllers: [
    VehicleController, 
    GetConstantsController, 
    UploadVehicleController, 
    CreateEditGetRatingController,
    FavoriteVehicleController
  ],
  providers: [
    GetVehicleService, 
    VehicleValidationService, 
    CreateUpdateDeleteVehicleService, 
    VehicleCleanUpService, 
    CreateEditRatingService,
    FavoriteVehicleService
  ],
  exports: [
    GetVehicleService, 
    VehicleValidationService, 
    CreateUpdateDeleteVehicleService, 
    VehicleCleanUpService, 
    CreateEditRatingService,
    FavoriteVehicleService
  ]
})
export class VehicleModule {}
