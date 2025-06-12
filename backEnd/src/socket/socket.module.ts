import { forwardRef, Module } from '@nestjs/common';

// Imports chat controller.
import { GetMessageController } from './controllers/getMessage.controller';

// Imports socket services.
import { SocketService } from './services/socket.service';
import { NotificationService } from './services/notification.service';

// Import socket exception filter.
import { SocketExceptionFilter } from '../errorHandler/socketException.filter';

// Import socket gateway.
import { SocketGateway } from './socket.gateway';

// Imports socket jwt guard.
import { SocketJwtGuard } from './guard/socket-jwt.guard';

// Imports chat services.
import { ChatService } from './services/chat.service';
import { ChatCleanUpService } from './services/chatCleanUp.service';

// Imports auth module.
import { AuthModule } from '../auth/auth.module';

// Imports typeorm.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports notification entity.
import { NotificationEntity } from './entities/notification.entity';

// Imports chat entity.
import { ChatEntity } from './entities/chat.entity';

// Imports cloudinary module.
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([NotificationEntity, ChatEntity]),
    CloudinaryModule,
  ],
  providers: [
    SocketService,
    NotificationService,
    SocketExceptionFilter,
    SocketGateway,
    SocketJwtGuard,
    ChatService,
    ChatCleanUpService,
  ],
  controllers: [
    GetMessageController,
  ],
  exports: [
    SocketService, 
    NotificationService,
    ChatService,
  ],
})
export class SocketModule {}
