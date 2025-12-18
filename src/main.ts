/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/intercepter/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

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

  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('The API description')
    .setVersion('1.0')
    // .addTag('api')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port as number);
}
bootstrap();
