import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { Feature } from '../../../src/domain/gamification/feature';
import { UtilisateurStatus } from '../../../src/domain/utilisateur/utilisateur';

describe('/utilisateurs - Inscription - (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('POST /utilisateurs_v2 - create new utilisateur avec seulement email et mot de passe', async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '2';
    process.env.WHITE_LIST_ENABLED = 'false';
    process.env.WHITE_LIST = 'hahah';
    process.env.OTP_DEV = '112233';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    // THEN
    const user = await utilisateurRepository.findByEmail('w@w.com');

    expect(response.status).toBe(201);
    expect(user.nom).toEqual(null);
    expect(user.prenom).toEqual(null);
    expect(user.annee_naissance).toEqual(null);
    expect(user.email).toEqual('w@w.com');
    expect(user.passwordHash.length).toBeGreaterThan(20);
    expect(user.passwordSalt.length).toBeGreaterThan(20);
    expect(user.code).toEqual('112233');
    expect(user.failed_checkcode_count).toEqual(0);
    expect(user.status).toEqual(UtilisateurStatus.creation_compte_etape_1);
    expect(user.prevent_checkcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.sent_email_count).toEqual(1);
    expect(user.prevent_sendemail_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.version).toEqual(2);
    expect(user.active_account).toEqual(false);

    expect(user.logement.code_postal).toEqual(null);
    expect(user.logement.commune).toEqual(null);
    expect(user.unlocked_features.isUnlocked(Feature.bibliotheque)).toEqual(
      true,
    );
    expect(user.unlocked_features.isUnlocked(Feature.univers)).toEqual(true);
  });
  it('POST /utilisateurs_v2 - no user version defaults to 0', async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = undefined;

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });
    expect(response.status).toBe(201);
    expect(user.version).toEqual(0);
  });

  it('POST /utilisateurs_v2 - bad password', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'false';
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: 'to use',
      email: 'monmail@truc.com',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Le mot de passe doit contenir au moins un chiffre',
    );
  });

  it('POST /utilisateurs_v2 - erreur 400 quand email existant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { email: 'w@w.com' });

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Adresse électronique w@w.com déjà existante',
    );
  });
  it('POST /utilisateurs_v2 - email au mauvais format', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'yotruc.com',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Format de l'adresse électronique yotruc.com incorrect`,
    );
  });
});
