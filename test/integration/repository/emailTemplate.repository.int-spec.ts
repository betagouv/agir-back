import { TestUtil } from '../../TestUtil';
import { EmailTemplateRepository } from '../../../src/infrastructure/email/templates/emailTemplate.repository';

describe('EmailTemplateRepository', () => {
  let emailTemplateRepository = new EmailTemplateRepository();

  beforeAll(async () => {
    await TestUtil.appinit();
    await emailTemplateRepository.onApplicationBootstrap();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('template email code inscription', async () => {
    // WHEN
    const result =
      await emailTemplateRepository.generate_email_inscription_code(
        'CODE',
        'LINK',
      );

    // THEN
    expect(result).toEqual(`Bonjour,<br>
Voici votre code pour valider votre inscription à l'application Agir !<br><br>
code : CODE<br><br>
Si vous n'avez plus la page ouverte pour saisir le code, ici le lien : <a href=\"LINK\">Page pour rentrer le code</a><br><br>
À très vite !`);
  });
});
