import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.useGlobalGuards(new ApiKeyAuthGuard());
  app.enableCors();
  app.use(helmet());

  // app versioning setup
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // making document for swagger UI
  const config = new DocumentBuilder()
    .setTitle('Organize Simple API')
    .setDescription(
      'Organize Simple is an API that allows you to organize your data in a way that is easy to use and understand with the power of large language models.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API key for authentication of registered application',
      },
      'apiKey',
    )
    .addTag('organize-simple')
    .build();

  // pass to swagger
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  //
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
