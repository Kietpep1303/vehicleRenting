import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

// Imports typeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports rental module and entities.
import { RentalModule } from 'src/rental/rental.module';
import { RentalEntity } from 'src/rental/entities/rental.entity';

// Imports socket module.
import { SocketModule } from 'src/socket/socket.module';

// Imports bull module.
import { BullModule } from '@nestjs/bull';

// Imports account level guard.
import { AccountLevelGuard } from '../common/guards/accountLevel.guard';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'rental-cancel-queue',
    }),
    TypeOrmModule.forFeature([RentalEntity]),
    RentalModule,
    SocketModule
  ],
  providers: [PaymentService, AccountLevelGuard],
  controllers: [PaymentController]
})
export class PaymentModule {}
