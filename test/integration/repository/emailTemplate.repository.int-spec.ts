import { TestUtil } from '../../TestUtil';
import { EmailTemplateRepository } from '../../../src/infrastructure/email/emailTemplate.repository';
import { TypeNotification } from '../../../src/domain/notification/notificationHistory';
import {
  SourceInscription,
  Utilisateur,
} from '../../../src/domain/utilisateur/utilisateur';

describe('EmailTemplateRepository', () => {
  const OLD_ENV = process.env;
  let emailTemplateRepository = new EmailTemplateRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
    await emailTemplateRepository.onApplicationBootstrap();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('template email code inscription', async () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'g@c.com',
      false,
      SourceInscription.web,
    );
    utilisateur.code = '123456';
    process.env.BASE_URL_FRONT = 'https://agir-front';
    process.env.BASE_URL = 'https://agir-back';

    // WHEN
    const result = await emailTemplateRepository.generateEmailByType(
      TypeNotification.inscription_code,
      utilisateur,
      'TOKEN_123',
    );

    // THEN
    expect(result).toEqual({
      body: `Bonjour,<br>
Voici votre code pour valider votre inscription à l'application J'agis !<br><br>
code : 123456<br><br>
Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="https://agir-front/validation-compte?email&#x3D;g@c.com">Page pour rentrer le code</a><br><br>
À très vite !`,
      subject: "Votre code d'inscription J'agis",
    });
  });
});
