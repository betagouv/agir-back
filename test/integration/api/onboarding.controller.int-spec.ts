import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  Impact,
  ThematiqueOnboarding,
} from '../../../src/domain/onboarding/onboarding';
import { DB, TestUtil } from '../../TestUtil';
import { Profil } from '../../../src/domain/utilisateur/utilisateurAttente';

const ONBOARDING_1_2_3_4_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  commune: 'Palaiseau',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_150',
  chauffage: 'bois',
  repas: 'viande',
  consommation: 'jamais',
};
const ONBOARDING_1_1_2_3_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  commune: 'Palaiseau',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_100',
  chauffage: 'bois',
  repas: 'vegan',
  consommation: 'jamais',
};
const ONBOARDING_1_1_2_2_DATA = {
  transports: ['moto', 'velo'],
  avion: 0,
  code_postal: '91120',
  commune: 'Palaiseau',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_100',
  chauffage: 'bois',
  repas: 'vegan',
  consommation: 'jamais',
};
const ONBOARDING_RES_1234 = {
  //version: 0,
  ventilation_par_thematiques: {
    alimentation: Impact.tres_eleve,
    transports: Impact.eleve,
    logement: Impact.faible,
    consommation: Impact.tres_faible,
  },
  ventilation_par_impacts: {
    '1': [ThematiqueOnboarding.consommation],
    '2': [ThematiqueOnboarding.logement],
    '3': [ThematiqueOnboarding.transports],
    '4': [ThematiqueOnboarding.alimentation],
  },
};

describe('/utilisateurs - Onboarding - (API test)', () => {
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

  it('POST /utilisateurs - create new utilisateur with given all data', async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '2';
    process.env.WHITE_LIST_ENABLED = 'false';
    process.env.WHITE_LIST = 'hahah';
    process.env.OTP_DEV = '123456';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await utilisateurRepository.findByEmail('w@w.com');

    expect(response.status).toBe(201);
    expect(user.nom).toEqual('WW');
    expect(user.prenom).toEqual('Wojtek');
    expect(user.email).toEqual('w@w.com');
    expect(user.passwordHash.length).toBeGreaterThan(20);
    expect(user.passwordSalt.length).toBeGreaterThan(20);
    expect({ ...user.onboardingData }).toStrictEqual({
      ...ONBOARDING_1_2_3_4_DATA,
    });
    expect({ ...user.onboardingResult }).toStrictEqual({
      ...ONBOARDING_RES_1234,
    });
    expect(user.code).toEqual('123456');
    expect(user.failed_checkcode_count).toEqual(0);
    expect(user.prevent_checkcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.sent_email_count).toEqual(1);
    expect(user.prevent_sendemail_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.version).toEqual(2);

    expect(user.logement.code_postal).toEqual('91120');
    expect(user.logement.commune).toEqual('Palaiseau');
    expect(user.logement.chauffage).toEqual(Chauffage.bois);
    expect(user.logement.nombre_adultes).toEqual(2);
    expect(user.logement.nombre_enfants).toEqual(1);
    expect(user.logement.proprietaire).toEqual(true);
    expect(user.logement.superficie).toEqual(Superficie.superficie_150);
    expect(user.logement.type).toEqual(TypeLogement.maison);
  });
  it('POST /utilisateurs - no user version defaults to 0', async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = undefined;
    process.env.WHITE_LIST_ENABLED = 'false';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(response.status).toBe(201);
    expect(user.version).toEqual(0);
  });
  it('POST /utilisateurs - returns error when not white listed email', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'w@w.com';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'La beta de ce service est pour le moment réservée aux beta-testeurs, merci de nous contacter si vous voulez en être !',
    );
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(user).toBeNull();
  });
  it('POST /utilisateurs - returns NO error when email match as case insensitive', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'w@w.com';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'W@W.COM',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /utilisateurs - white liste dijon OK aussi', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'yo.com';
    process.env.WHITE_LIST_DIJON = 'w@w.com';

    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'W@W.COM',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /utilisateurs - bad password', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'false';
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: 'to use',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Le mot de passe doit contenir au moins un chiffre',
    );
  });
  it('POST /utilisateurs/renvoyer_code - PROD true - resend code ok for first time, counter + 1, new code generated', async () => {
    // GIVEN
    process.env.IS_PROD = 'true';
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    const userDB_before = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    expect(userDB.sent_email_count).toEqual(2);
    expect(userDB.code).not.toEqual(userDB_before.code);
  });

  it('POST /utilisateurs/renvoyer_code - PROD false - resend code ok for first time, counter + 1, same code generated', async () => {
    // GIVEN
    process.env.IS_PROD = 'false';
    process.env.OTP_DEV = '123456';
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    const userDB_before = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'w@w.com' });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    expect(userDB.sent_email_count).toEqual(2);
    expect(userDB.code).toEqual(userDB_before.code);
  });

  it('POST /utilisateurs/email/renvoyer_code - resend code 4 times => error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
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
      where: { nom: 'WW' },
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

    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
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
      where: { nom: 'WW' },
    });

    expect(userDB.active_account).toEqual(true);
    expect(userDB.failed_login_count).toEqual(0);
    expect(userDB.prevent_login_before.getTime()).toBeLessThan(Date.now());
  });
  it('POST /utilisateurs/valider - code trop vieux (+10 min) renvoie une erreur', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    await TestUtil.prisma.utilisateur.update({
      where: { email: 'w@w.com' },
      data: {
        code_generation_time: new Date(Date.now() - 10 * 60 * 1000),
      },
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
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
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
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
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
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
      where: { nom: 'WW' },
    });
    expect(userDB.active_account).toEqual(false);
    expect(userDB.failed_checkcode_count).toEqual(1);
  });
  it('POST /utilisateurs/valider - bad code 4 times, blocked account', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
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
      where: { nom: 'WW' },
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
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data to compute impact', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_2_3_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.transports).toEqual(3);
    expect(response.body.alimentation).toEqual(4);
    expect(response.body.logement).toEqual(2);
    expect(response.body.consommation).toEqual(1);
    expect(response.body.phrase_1.phrase).toEqual(
      'Accédez à toutes les <strong>aides publiques pour la transition écologique</strong> en quelques clics : <strong>consommation responsable, vélo, voiture éléctrique, rénovation énergétique</strong> pour les propriétaires…',
    );
    expect(response.body.phrase_2.phrase).toEqual(
      'Regarder les offres de <strong>transports dans la zone de Palaiseau</strong> en fonction de vos besoins et usages',
    );
    expect(response.body.phrase_3.phrase).toEqual(
      'Trouver des solutions <strong>même quand on adore la viande</strong>',
    );
    expect(response.body.phrase_4.phrase).toEqual(`3 sous le même toit ?
<strong>Comprendre ses impacts à l'échelle de votre famille</strong> ou de votre colocation`);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data to compute impact , other dataset', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_2_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.transports).toEqual(2);
    expect(response.body.logement).toEqual(2);
    expect(response.body.alimentation).toEqual(1);
    expect(response.body.consommation).toEqual(1);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v1', async () => {
    // WHEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: '1' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: '2' });
    await TestUtil.create(DB.utilisateur, { id: '3', email: '3' });
    await TestUtil.create(DB.utilisateur, {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create(DB.utilisateur, {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [
            ThematiqueOnboarding.consommation,
            ThematiqueOnboarding.logement,
          ],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [ThematiqueOnboarding.logement],
          '3': [ThematiqueOnboarding.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_2_3_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase).toEqual(
      `<strong>Comme 1 utilisateur sur 2, vos impacts sont forts ou très forts dans 2 thématiques.</strong> Pour vous il s'agit des thématiques <strong>transports et alimentation</strong>.`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v2', async () => {
    // WHEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: '1' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: '2' });
    await TestUtil.create(DB.utilisateur, { id: '3', email: '3' });
    await TestUtil.create(DB.utilisateur, {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create(DB.utilisateur, {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [
            ThematiqueOnboarding.consommation,
            ThematiqueOnboarding.logement,
          ],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [ThematiqueOnboarding.logement],
          '3': [ThematiqueOnboarding.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_3_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase).toEqual(
      `<strong>Comme 6 utilisateurs sur 10, vos impacts sont forts ou très forts dans au moins une thématique</strong>. Pour vous il s'agit de la thématique <strong>transports</strong>.`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v3', async () => {
    // WHEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: '1' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: '2' });
    await TestUtil.create(DB.utilisateur, { id: '3', email: '3' });
    await TestUtil.create(DB.utilisateur, {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create(DB.utilisateur, {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [
            ThematiqueOnboarding.consommation,
            ThematiqueOnboarding.logement,
          ],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.transports,
          ],
          '2': [ThematiqueOnboarding.logement],
          '3': [ThematiqueOnboarding.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_2_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase).toEqual(
      `<strong>Comme 1 utilisateur sur 3, vos impacts sont faibles ou très faibles dans l'ensemble des thématiques</strong>. Vous faîtes partie des utilisateurs les plus sobres, bravo !`,
    );
  });

  it('POST /utilisateurs - erreur 400 quand email existant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { email: 'w@w.com' });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHAa',
        email: 'w@w.com',
        onboardingData: { ...ONBOARDING_1_2_3_4_DATA },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Adresse électronique w@w.com déjà existante',
    );
  });
  it('POST /utilisateurs - email au mauvais format', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yotruc.com',
        onboardingData: { ...ONBOARDING_1_2_3_4_DATA },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Format de l'adresse électronique yotruc.com incorrect`,
    );
  });
  it('POST /utilisateurs - error when bad value in onboarding data', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: 'to use',
        email: 'mon mail',
        onboardingData: {
          ...ONBOARDING_1_2_3_4_DATA,
          residence: 'mauvaise valeur',
        },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Valeur residence [mauvaise valeur] inconnue',
    );
  });
  it('POST /utilisateurs/check_whiteliste - true si white listé', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'mon mail';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/check_whiteliste')
      .send({
        email: 'mon mail',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      is_whitelisted: true,
      is_registered: false,
    });
  });
  it('POST /utilisateurs/check_whiteliste - false si pas white listé', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'mon mail';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/check_whiteliste')
      .send({
        email: 'bad',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      is_whitelisted: false,
      is_registered: false,
    });
  });
  it('POST /utilisateurs/check_whiteliste - true si le useer eexiste en base', async () => {
    // GIVEN
    process.env.WHITE_LIST_ENABLED = 'true';
    process.env.WHITE_LIST = 'mon mail';

    await TestUtil.create(DB.utilisateur, { email: 'email' });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/check_whiteliste')
      .send({
        email: 'email',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      is_whitelisted: false,
      is_registered: true,
    });
  });
  it(`POST /utilisateurs/file_attente - ajout l'email à la file d'attente`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '10';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email: 'hahahas',
        code_postal: '21000',
        code_profil: Profil.citoyen,
      });
    // THEN
    expect(response.status).toBe(201);

    const attenteDB = await TestUtil.prisma.fileAttente.findUnique({
      where: { email: 'hahahas' },
    });

    expect(attenteDB.code_postal).toEqual('21000');
    expect(attenteDB.code_profil).toEqual(Profil.citoyen);
  });
  it(`POST /utilisateurs/file_attente - maj l'email en d'attente`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '10';
    await TestUtil.prisma.fileAttente.create({
      data: {
        email: 'hahahas',
        code_profil: Profil.entreprise,
        code_postal: '91120',
      },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email: 'hahahas',
        code_postal: '21000',
        code_profil: Profil.citoyen,
      });
    // THEN
    expect(response.status).toBe(201);

    const attenteDB = await TestUtil.prisma.fileAttente.findUnique({
      where: { email: 'hahahas' },
    });

    expect(attenteDB.code_postal).toEqual('21000');
    expect(attenteDB.code_profil).toEqual(Profil.citoyen);
  });
  it(`POST /utilisateurs/file_attente - si max user / jour => erreur 400`, async () => {
    // GIVEN
    await TestUtil.prisma.fileAttente.create({
      data: {
        email: 'hahahas',
        code_profil: Profil.entreprise,
        code_postal: '91120',
      },
    });
    await TestUtil.prisma.fileAttente.create({
      data: {
        email: 'hihihis',
        code_profil: Profil.citoyen,
        code_postal: '21000',
      },
    });
    process.env.MAX_ATTENTE_JOUR = '2';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email: 'hohohos',
        code_postal: '75000',
        code_profil: Profil.citoyen,
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Liste d'attente complète pour aujourd'hui !",
    );
  });
  it(`POST /utilisateurs/file_attente - 400 si mail manquant`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '2';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        code_postal: '75000',
        code_profil: Profil.citoyen,
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Mauvais inputs pour la mise en file d'attente",
    );
  });
  it(`POST /utilisateurs/file_attente - 400 si mail trop long`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '2';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email:
          '12345678901234567890123456789012345678901234567890123456789001234567890123456789012345678901234567890',
        code_postal: '75000',
        code_profil: Profil.citoyen,
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Mauvais inputs pour la mise en file d'attente",
    );
  });
  it(`POST /utilisateurs/file_attente - 400 si code profil KO`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '2';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email: 'haha',
        code_postal: '75000',
        code_profil: 'bad',
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Mauvais inputs pour la mise en file d'attente",
    );
  });
  it(`POST /utilisateurs/file_attente - 400 si code postal par sur 5 char`, async () => {
    // GIVEN
    process.env.MAX_ATTENTE_JOUR = '2';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/file_attente')
      .send({
        email: 'haha',
        code_postal: '75000qq',
        code_profil: Profil.entreprise,
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Mauvais inputs pour la mise en file d'attente",
    );
  });
});
