import { EmailSender } from '../../src/infrastructure/email/emailSender';
import { TestUtil } from '../TestUtil';

describe('EmailSender', () => {
  const OLD_ENV = process.env;
  let emailSender = new EmailSender();

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('searchsearch : envoie le template avec mirror OK', async () => {
    // GIVEN
    // WHEN
    await emailSender.sendEmail(
      'w@dev.com',
      'wwo',
      `<a href="{{ mirror }}"
title="Afficher dans le navigateur"
target="_blank"
style="color: #000091; text-decoration: underline;"><span
style="color: #3b3f44; font-family: Arial, helvetica, sans-serif;">Afficher
dans le
navigateur</span></a>`,
      'hello yo',
    );
  });
});
