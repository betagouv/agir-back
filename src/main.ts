import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { AppModule } from './app.module';
import { App } from './domain/app';
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
    .setTitle(`Backend de l'application "j'agis"`)
    .setDescription(
      `Doc API executable, tous les endpoints sont testables en conditions réelles`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, swaggerDocumentOptions);

  // Activation de Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: App.isProd() ? 'PROD' : 'DEV',
  });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  const bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: '5mb' }));
  //app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  // Activation des requetes cross origin pour le front
  app.enableCors();

  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
