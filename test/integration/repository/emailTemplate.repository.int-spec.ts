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
    const result = await emailTemplateRepository.generateUserEmailByType(
      TypeNotification.inscription_code,
      utilisateur,
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

  it('template email code connexion', async () => {
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
    const result = await emailTemplateRepository.generateUserEmailByType(
      TypeNotification.connexion_code,
      utilisateur,
    );

    // THEN
    expect(result).toEqual({
      body: `Bonjour,<br>
Voici votre code pour valider votre connexion à l'application J'agis !<br><br>
    
code : 123456<br><br>

Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href="https://agir-front/validation-authentification?email&#x3D;g@c.com">Page pour rentrer le code</a><br><br>
    
À très vite !`,
      subject: "123456 - Votre code connexion à J'agis",
    });
  });

  it('template email code oubli de mot de passe', async () => {
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
    const result = await emailTemplateRepository.generateUserEmailByType(
      TypeNotification.change_mot_de_passe_code,
      utilisateur,
    );

    // THEN
    expect(result).toEqual({
      body: `Bonjour,<br>
Voici votre code pour pouvoir modifier votre mot de passe de l'application J'agis !<br><br>
    
code : 123456<br><br>

Si vous n'avez plus la page ouverte pour saisir le code et modifier le mot de passe, ici le lien : <a href="https://agir-front/mot-de-passe-oublie/redefinir-mot-de-passe?email&#x3D;g@c.com">Page pour modifier votre mot de passe</a><br><br>
    
À très vite !`,
      subject: "Modification de mot de passe J'agis",
    });
  });

  it('template email se connecter plutôt que créer un compte', async () => {
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
    const result = await emailTemplateRepository.generateAnonymousEmailByType(
      TypeNotification.email_existing_account,
    );

    // THEN
    expect(result).toEqual({
      body: `Bonjour,<br>
Vous avez essayé de vous inscrire sur J'agis alors que nous avons déjà un compte pour cet email !<br><br>
    
Veuillez plutôt vous rendre sur la <a href="https://agir-front/authentification">page de connexion</a> pour vous connecter.

À très vite !`,
      subject: "Connectez vous à J'agis !",
    });
  });
});
