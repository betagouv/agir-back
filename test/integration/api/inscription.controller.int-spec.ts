import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import { Feature } from '../../../src/domain/gamification/feature';
import { UtilisateurStatus } from '../../../src/domain/utilisateur/utilisateur';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Categorie } from '../../../src/domain/contenu/categorie';

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
    process.env.OTP_DEV = '112233';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
    });
    // THEN
    const user = await utilisateurRepository.findByEmail('w@w.com');

    expect(response.status).toBe(201);
    expect(user.nom).toEqual(null);
    expect(user.prenom).toEqual(null);
    expect(user.annee_naissance).toEqual(null);
    expect(user.email).toEqual('w@w.com');
    expect(user.source_inscription).toEqual('mobile');
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
    expect(user.unlocked_features.isUnlocked(Feature.univers)).toEqual(true);
    expect(user.unlocked_features.isUnlocked(Feature.services)).toEqual(true);
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

  it('POST /utilisateurs - returns NO error when email match as case insensitive', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'W@W.COM',
    });
    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /utilisateurs/renvoyer_code - PROD true - resend code ok for first time, counter + 1, new code generated', async () => {
    // GIVEN
    process.env.IS_PROD = 'true';
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    const userDB_before = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    expect(userDB.sent_email_count).toEqual(2);
    expect(userDB.code).not.toEqual(userDB_before.code);
  });

  it('POST /utilisateurs/renvoyer_code - pas derreur di mauvais email', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'wGAHAHA@w.com' });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    expect(userDB.sent_email_count).toEqual(1);
  });

  it('POST /utilisateurs/renvoyer_code - PROD false - resend code ok for first time, counter + 1, same code generated', async () => {
    // GIVEN
    process.env.IS_PROD = 'false';
    process.env.OTP_DEV = '123456';
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    const userDB_before = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    expect(userDB.sent_email_count).toEqual(2);
    expect(userDB.code).toEqual(userDB_before.code);
  });

  it('POST /utilisateurs/email/renvoyer_code - resend code 4 times => error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });
    expect(response.status).toBe(400);

    expect(userDB.sent_email_count).toEqual(3);
    expect(userDB.prevent_sendemail_before.getTime()).toBeGreaterThan(
      Date.now(),
    );
  });
  it('POST /utilisateurs/valider - validate proper code OK, active user as outcome', async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '0';

    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'w@w.com',
        code: userDB.code,
      });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body.token.length).toBeGreaterThan(20);

    userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    expect(userDB.active_account).toEqual(true);
    expect(userDB.failed_login_count).toEqual(0);
    expect(userDB.prevent_login_before.getTime()).toBeLessThan(Date.now());
  });
  it('POST /utilisateurs/valider - code trop vieux (+10 min) renvoie une erreur', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    await TestUtil.prisma.utilisateur.update({
      where: { email: 'w@w.com' },
      data: {
        code_generation_time: new Date(Date.now() - 10 * 60 * 1000),
      },
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'w@w.com',
        code: userDB.code,
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );
  });
  it('POST /utilisateurs/valider - validate 2 times , already active account error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'w@w.com',
      code: userDB.code,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'w@w.com',
        code: userDB.code,
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Ce compte est déjà actif');
  });
  it('POST /utilisateurs/valider - bad code increase counter', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'w@w.com',
        code: 'bad',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });
    expect(userDB.active_account).toEqual(false);
    expect(userDB.failed_checkcode_count).toEqual(1);
  });
  it('POST /utilisateurs/valider - bad code 4 times, blocked account', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'w@w.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'w@w.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'w@w.com',
      code: 'bad',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'w@w.com',
        code: 'bad',
      });

    const dbUser = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    // THEN
    expect(response.body.message).toContain(
      `Trop d'essais successifs, attendez jusqu'à`,
    );
    expect(dbUser.failed_checkcode_count).toEqual(4); // le compteur reste bloqué sur 4
    expect(dbUser.prevent_checkcode_before.getTime()).toBeGreaterThan(
      new Date().getTime(),
    );
  });

  it(`POST /utilisateurs_v2 - integration situation NGC à l'inscription`, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_km,
      type: TypeReponseQuestionKYC.entier,
      is_ngc: true,
      question: `Km en voiture ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [],
      ngc_key: 'transport . voiture . km',
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC_chauffage_bois,
      type: TypeReponseQuestionKYC.choix_unique,
      is_ngc: true,
      question: `chauffage bois ?`,
      points: 10,
      categorie: Categorie.test,
      reponses: [
        { label: 'Oui', code: 'oui', ngc_code: 'oui' },
        { label: 'Non', code: 'non', ngc_code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas', ngc_code: null },
      ],
      ngc_key: 'logement . chauffage . bois . présent',
    });

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .send({
        situation: {
          'transport . voiture . km': 20000,
          'logement . chauffage . bois . présent': 'oui',
        },
      });

    const situtation_id = response_post_situation.headers.location
      .split('=')
      .pop();

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com');

    const kyc_voiture = user.kyc_history.getAnsweredQuestionByCode(
      KYCID.KYC_transport_voiture_km,
    );
    expect(kyc_voiture).not.toBeUndefined();
    expect(kyc_voiture.hasAnyResponses()).toEqual(true);
    expect(kyc_voiture.listeReponsesLabels()).toEqual(['20000']);

    const kyc_bois = user.kyc_history.getAnsweredQuestionByCode(
      KYCID.KYC_chauffage_bois,
    );
    expect(kyc_bois).not.toBeUndefined();
    expect(kyc_bois.hasAnyResponses()).toEqual(true);
    expect(kyc_bois.listeReponsesLabels()).toEqual(['Oui']);
  });
  it(`POST /utilisateurs_v2 - integration situation NGC , pas d'erreurs si clé pas connu`, async () => {
    // GIVEN
    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .send({
        situation: {
          'transport . velo . km': 150,
        },
      });

    const situtation_id = response_post_situation.headers.location
      .split('=')
      .pop();

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });
    // THEN

    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com');

    expect(user.kyc_history.answered_questions).toHaveLength(0);
  });
});