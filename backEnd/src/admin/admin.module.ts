import { forwardRef, Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './services/admin.service';
import { AdminGateway } from './admin.gateway';

// Imports account level guard.
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';

// Imports typeORM module.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports user module.
import { UserModule } from '../user/user.module';

// Imports auth module.
import { AuthModule } from '../auth/auth.module';

// Imports vehicle module.
import { VehicleModule } from '../vehicle/vehicle.module';

// Imports user entity.
import { UserEntity } from '../user/entities/user.entity';

// Imports vehicle entity.
import { VehicleEntity } from '../vehicle/entities/vehicle.entity';

// Imports auth entity.
import { AuthEntity } from '../auth/entities/auth.entity';

// Imports get-create-delete service
import { GetCreateDeleteUserVehicleService } from './services/getCreateDeleteUserVehicle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, VehicleEntity, AuthEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => VehicleModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminService, GetCreateDeleteUserVehicleService, AdminGateway, AccountLevelGuard],
  exports: [AdminGateway],  
})
export class AdminModule {}
