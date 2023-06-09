import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Exposition Swagger
  const config = new DocumentBuilder()
    .setTitle('Agir back')
    .setDescription('Doc API Agir')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Activation des requetes cross origin pour le front
  app.enableCors();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
