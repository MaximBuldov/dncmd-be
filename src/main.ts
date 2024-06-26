import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformDateInterceptor } from './interseptors/transform-date.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformDateInterceptor());
  app.setGlobalPrefix('api');
  app.enableCors({
    exposedHeaders: 'Total'
  });
  await app.listen(4200);
}
bootstrap();
