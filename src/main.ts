/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/intercepter/transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that don't have decorators
      forbidNonWhitelisted: true, // reject unknown properties
      transform: true, // auto-transform payload to DTO class instance
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  const port = app.get(ConfigService).get<number>('PORT');
  await app.listen(port as number);
}
bootstrap();
