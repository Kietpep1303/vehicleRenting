import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './errorHandler/allExceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,          
    forbidNonWhitelisted: true, 
    transform: true,    
  }));

  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
