import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interseptors/logger.interceptor';
import { TransformDateInterceptor } from './interseptors/transform-date.interceptor';
import { instance } from './logger/winston.logger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: instance
    })
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(
    new TransformDateInterceptor(),
    new LoggingInterceptor()
  );
  app.enableCors({
    origin: ['https://dncmd.com', 'http://localhost:3000'],
    exposedHeaders: 'Total'
  });
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
