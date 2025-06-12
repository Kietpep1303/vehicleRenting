import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

// Imports account level guard.
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';

// Imports typeORM module.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports user module.
import { UserModule } from '../user/user.module';

// Imports vehicle module.
import { VehicleModule } from '../vehicle/vehicle.module';

// Imports user entity.
import { UserEntity } from '../user/entities/user.entity';

// Imports vehicle entity.
import { VehicleEntity } from '../vehicle/entities/vehicle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, VehicleEntity]),
    UserModule,
    VehicleModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, AccountLevelGuard]
})
export class AdminModule {}
