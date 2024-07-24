import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './infrastructure/sentry.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Exposition Swagger
  const swaggerDocumentOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      tryItOutEnabled: false,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  };
  const config = new DocumentBuilder()
    .setTitle('Agir back')
    .setDescription('Doc API Agir')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, swaggerDocumentOptions);

  // Activation de Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    tracesSampleRate: 1.0,
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  // Activation des requetes cross origin pour le front
  app.enableCors();

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
