import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.enableCors();
  app.use(helmet());

  // making document for swagger UI
  const config = new DocumentBuilder()
    .setTitle('Organize Simple API')
    .setDescription(
      'Organize Simple is an API that allows you to organize your data in a way that is easy to use and understand with the power of large language models.',
    )
    .setVersion('1.0')
    .addTag('organize-simple')
    .build();

  // pass to swagger
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // app versioning setup
  app.enableVersioning({
    type: VersioningType.URI,
  });

  //
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
