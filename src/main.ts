import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Exposition Swagger
  const swaggerDocumentOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      tryItOutEnabled: true,
    },
  };
  const config = new DocumentBuilder()
    .setTitle('Agir back')
    .setDescription('Doc API Agir')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, swaggerDocumentOptions);

  // Activation des requetes cross origin pour le front
  app.enableCors();

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
