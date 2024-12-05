import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ProfileUsecase } from '../src/usecase/profile.usecase';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];

  switch (command) {
    case 'liste_prenoms':
      const profileUsecase = application.get(ProfileUsecase);
      const liste = await profileUsecase.listPrenomsAValider();
      console.log(liste);
      break;
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
