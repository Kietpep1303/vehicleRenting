import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Imports chat controller.
import { GetMessageController } from './controllers/message.controller';

// Imports socket services.
import { NotificationService } from './services/notification.service';

// Import socket exception filter.
import { SocketExceptionFilter } from '../errorHandler/socketException.filter';

// Import socket gateway.
import { SocketGateway } from './gateways/socket.gateway';
import { ChatGateway } from './gateways/chat.gateway';
import { NotificationGateway } from './gateways/notification.gateway';

// Imports socket jwt guard.
import { SocketJwtGuard } from './guard/socket-jwt.guard';

// Imports chat services.
import { ChatService } from './services/chat.service';

// Imports auth module.
import { AuthModule } from '../auth/auth.module';

// Imports user module.
import { UserModule } from '../user/user.module';

// Imports typeorm.
import { TypeOrmModule } from '@nestjs/typeorm';

// Imports notification entity.
import { NotificationEntity } from './entities/notification.entity';

// Imports chat entity.
import { ChatEntity } from './entities/chat.entity';
import { ChatUserEntity } from './entities/chatUser.entity';
import { ChatMessageEntity } from './entities/chatMessage.entity';

// Imports cloudinary module.
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

// Imports notification controller.
import { NotificationController } from './controllers/notification.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([NotificationEntity, ChatEntity, ChatUserEntity, ChatMessageEntity]),
    CloudinaryModule,
    HttpModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    NotificationService,
    SocketExceptionFilter,
    SocketGateway,
    ChatGateway,
    NotificationGateway,
    SocketJwtGuard,
    ChatService,
  ],
  controllers: [
    GetMessageController,
    NotificationController,
  ],
  exports: [
    NotificationService,
    ChatService,
  ],
})
export class SocketModule {}
