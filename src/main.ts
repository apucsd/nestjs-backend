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
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
  //  === FOR GLOBAL INTERCEPTOR ===
  app.useGlobalInterceptors(new TransformInterceptor());

  //  === FOR PORT ===
  const port = app.get(ConfigService).get<number>('PORT');

  //  === FOR SWAGGER ===
  const config = new DocumentBuilder()
    .setTitle('Swagger API')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();

  // === FOR GLOBAL PREFIX ===
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // === FOR SWAGGER ===
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port as number);
}
bootstrap();
