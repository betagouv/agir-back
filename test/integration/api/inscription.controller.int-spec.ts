import { App } from '../../../src/domain/app';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { KYCMosaicID } from '../../../src/domain/kyc/mosaicDefinition';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Superficie } from '../../../src/domain/logement/logement';
import { Thematique } from '../../../src/domain/thematique/thematique';
import {
  SourceInscription,
  UtilisateurStatus,
} from '../../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import _situationNGCTest from './situation_NGC_v3.6.3.json';

describe('/utilisateurs - Inscription - (API test)', () => {
  const OLD_ENV = process.env;
  const USER_CURRENT_VERSION = App.USER_CURRENT_VERSION;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
    await TestUtil.appclose();
  });

  it('POST /utilisateurs_v2 - inscription down', async () => {
    // GIVEN
    process.env.OTP_DEV = '112233';
    process.env.IS_INSCRIPTION_DOWN = 'true';
    process.env.EMAIL_CONTACT = 'XXXX';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
    });
    // THEN

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(`Bonjour,
suite à un problème technique, vous ne pouvez pas vous inscrire au service J'agis. Nous vous recommandons de réessayer dans quelques heures. Si le problème persiste vous pouvez joindre notre support en envoyant un mail à XXXX`);
  });
  it('POST /utilisateurs_v2 - create new utilisateur avec seulement email et mot de passe', async () => {
    // GIVEN
    process.env.OTP_DEV = '112233';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
    });
    // THEN
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(response.status).toBe(201);
    expect(user.nom).toEqual(null);
    expect(user.prenom).toEqual(null);
    expect(user.annee_naissance).toEqual(null);
    expect(user.mois_naissance).toEqual(null);
    expect(user.jour_naissance).toEqual(null);
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
    expect(user.sent_email_count).toEqual(0);
    expect(user.prevent_sendemail_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.active_account).toEqual(false);

    expect(user.logement.code_postal).toEqual(undefined);
    expect(user.logement.commune).toEqual(undefined);
  });
  it('POST /utilisateurs_v2 - no user version defaults to App version', async () => {
    // GIVEN

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
    expect(user.version).toEqual(24);
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

  it('POST /utilisateurs_v2 - silence quand email existant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { email: 'w@w.com' });

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    // THEN
    expect(response.status).toBe(201);
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

    expect(userDB.sent_email_count).toEqual(1);
    expect(userDB.code).not.toEqual(userDB_before.code);
  });

  it('POST /utilisateurs/renvoyer_code - pas derreur si mauvais email', async () => {
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

    expect(userDB.sent_email_count).toEqual(0);
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

    expect(userDB.sent_email_count).toEqual(1);
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
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });
    expect(response.status).toBe(400);

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'w@w.com' },
    });

    expect(userDB.sent_email_count).toEqual(4);
    expect(userDB.prevent_sendemail_before.getTime()).toBeGreaterThan(
      Date.now(),
    );
  });
  it('POST /utilisateurs/valider - validate proper code OK, active user as outcome', async () => {
    // GIVEN
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
    process.env.NGC_API_KEY = '12345';

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
    await kycRepository.loadCache();

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'transport . voiture . km': 20000,
          'logement . chauffage . bois . présent': 'oui',
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    const kyc_voiture = user.kyc_history.getQuestionNumerique(
      KYCID.KYC_transport_voiture_km,
    );
    expect(kyc_voiture).not.toBeUndefined();
    expect(kyc_voiture.isAnswered()).toEqual(true);
    expect(kyc_voiture.getValue()).toEqual(20000);

    const kyc_bois = user.kyc_history.getQuestion(KYCID.KYC_chauffage_bois);
    expect(kyc_bois).not.toBeUndefined();
    expect(kyc_bois.is_answered).toEqual(true);
    expect(kyc_bois.getSelectedCode()).toEqual('oui');
  });

  it(`POST /utilisateurs_v2 - integration situation NGC => set id utilisateur sur situation`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'transport . voiture . km': 20000,
          'logement . chauffage . bois . présent': 'oui',
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    const situtation = await TestUtil.prisma.situationNGC.findUnique({
      where: {
        id: situtation_id,
      },
    });

    expect(situtation.utilisateurId).toEqual(user.id);
  });

  it(`POST /utilisateurs_v2 - integration situation NGC  => feature bilan carbone dispo de suite`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'transport . voiture . km': 20000,
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(user.cache_bilan_carbone.est_bilan_complet).toEqual(true);
  });

  it(`POST /utilisateurs_v2 - integration situation NGC => maj logement`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_superficie,
      type: TypeReponseQuestionKYC.entier,
      is_ngc: true,
      question: `superificie logement`,
      points: 10,
      categorie: Categorie.test,
      reponses: [],
      ngc_key: 'logement . surface',
    });
    await kycRepository.loadCache();

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'logement . surface': 123,
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(user.logement.superficie).toEqual(Superficie.superficie_150);
  });

  it(`POST /utilisateurs_v2 - integration situation NGC => prise en compte de l'hybride`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_transport_voiture_motorisation,
      type: TypeReponseQuestionKYC.choix_unique,
      is_ngc: true,
      question: `transport . voiture . motorisation`,
      points: 10,
      categorie: Categorie.test,
      reponses: [
        {
          label: 'Électrique',
          code: 'electrique',
          ngc_code: 'électrique',
        },
        {
          label: 'Thermique',
          code: 'thermique',
          ngc_code: 'thermique',
        },
        {
          label: 'Hybride rechargeable',
          code: 'hybride_rechargeable',
          ngc_code: 'hybride rechargeable',
        },
        {
          label: 'Hybride non rechargeable',
          code: 'hybride_non_rechargeable',
          ngc_code: 'hybride non rechargeable',
        },
      ],
      ngc_key: 'transport . voiture . motorisation',
    });
    await kycRepository.loadCache();

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'transport . voiture . motorisation': 'hybride',
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');
    user.kyc_history.getQuestion(KYCID.KYC_transport_voiture_motorisation);
    expect(
      user.kyc_history
        .getQuestion(KYCID.KYC_transport_voiture_motorisation)
        .getSelectedCode(),
    ).toEqual('hybride_non_rechargeable');
  });

  it(`POST /utilisateurs_v2 - test situtation "complete"`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_local_frequence,
      type: TypeReponseQuestionKYC.choix_unique,
      is_ngc: true,
      question: `KYC_local_frequence`,
      points: 10,
      categorie: Categorie.test,
      reponses: [
        {
          code: 'jamais',
          label: 'Jamais',
          ngc_code: "'jamais'",
        },
        {
          code: 'parfois',
          label: 'Parfois',
          ngc_code: "'parfois'",
        },
        {
          code: 'souvent',
          label: 'Souvent',
          ngc_code: "'souvent'",
        },
        {
          code: 'toujours',
          label: 'Toujours',
          ngc_code: "'oui toujours'",
        },
        {
          code: 'ne_sais_pas',
          label: 'Je ne sais pas',
          ngc_code: null,
        },
      ],
      ngc_key: 'alimentation . local . consommation',
    });
    await kycRepository.loadCache();

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: _situationNGCTest,
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(
      user.kyc_history.getQuestion(KYCID.KYC_local_frequence),
    ).not.toBeNull();
  });
  it(`POST /utilisateurs_v2 - integration situation NGC , pas d'erreurs si clé pas connu`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'transport . velo . km': 150,
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });
    // THEN

    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(user.kyc_history.getAnsweredKYCs()).toHaveLength(0);
  });
  it(`POST /utilisateurs_v2 - integration situation NGC , pas d'erreurs n importe quoi `, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';
    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'c est vraime null': 's:fqjvvq',
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });
    // THEN

    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(user.kyc_history.getAnsweredKYCs()).toHaveLength(0);
  });

  it(`POST /utilisateurs_v2 - integration situation NGC touches les mosaics`, async () => {
    // GIVEN
    process.env.NGC_API_KEY = '12345';

    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_chauffage_fioul,
      is_ngc: true,
      points: 10,
      question: 'The question !',
      tags: [],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'logement . chauffage . fioul . présent',
      reponses: [
        { label: 'OUI', code: 'oui', ngc_code: '_oui' },
        { label: 'NON', code: 'non', ngc_code: '_non' },
        { label: 'Ne sais pas', code: 'ne_sais_pas' },
      ],
    });
    await kycRepository.loadCache();

    // WHEN
    const response_post_situation = await TestUtil.getServer()
      .post('/bilan/importFromNGC')
      .set('apikey', `12345`)
      .send({
        situation: {
          'logement . chauffage . fioul . présent': '_oui',
        },
      });

    let situtation_id = TestUtil.getSitutationIdFromRedirectURL(
      response_post_situation.body.redirect_url,
    );

    const response = await TestUtil.getServer().post('/utilisateurs_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      source_inscription: 'mobile',
      situation_ngc_id: situtation_id,
    });

    // THEN
    expect(response.status).toBe(201);
    const user = await utilisateurRepository.findByEmail('w@w.com', 'full');

    expect(
      user.kyc_history
        .getQuestionChoixUnique(KYCID.KYC_chauffage_fioul)
        .isAnswered(),
    ).toEqual(true);
    expect(user.kyc_history.getAnsweredMosaics()).toHaveLength(2);
    expect(
      user.kyc_history.isMosaicAnswered(KYCMosaicID.MOSAIC_CHAUFFAGE),
    ).toEqual(true);
  });

  it(`GET /login_france_connect stock source souscription et id de situation NGC`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456&source_inscription=mobile',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states).toHaveLength(1);
    const state = states[0];
    expect(state.situation_ngc_id).toEqual(
      '123456789012345678901234567890123456',
    );
    expect(state.source_inscription).toEqual('mobile');

    expect(reponse.headers['location']).toEqual(
      `https://fc_auth.com/?response_type=code&client_id=client_id_123&redirect_uri=https%3A%2F%2Fjagis%2Fcallback&scope=openid+email+given_name+family_name+birthdate&acr_values=eidas1&state=${state.state}&nonce=${state.nonce}`,
    );
  });
  it(`GET /login_france_connect missing source`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states[0].source_inscription).toEqual(SourceInscription.inconnue);
  });

  it(`GET /login_france_connect bad source`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456&source_inscription=bad',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states[0].source_inscription).toEqual(SourceInscription.inconnue);
  });
});
