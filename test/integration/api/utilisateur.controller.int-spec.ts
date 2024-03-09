import { DB, TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { Impact } from '../../../src/domain/utilisateur/onboarding/onboarding';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/utilisateur/logement';
var crypto = require('crypto');

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

function getFakeUtilisteur() {
  return {
    id: null,
    passwordHash: '',
    passwordSalt: '',
    failed_login_count: 0,
    prevent_login_before: new Date(),
  };
}

describe('/utilisateurs - Compte utilisateur (API test)', () => {
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

  it('GET /utilisateurs/id - when missing', async () => {
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
    // THEN
    expect(response.status).toBe(404);
  });
  it('DELETE /utilisateurs/id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.suivi);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.empreinte);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.groupe);
    await TestUtil.create(DB.groupeAbonnement);
    await TestUtil.create(DB.thematique);

    // WHEN
    const response = await TestUtil.DELETE('/utilisateurs/utilisateur-id');

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUser).toBeNull();
  });
  it('GET /utilisateurs/id - 401 si pas de token', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(401);
  });
  it('GET /utilisateurs/id - ok si token', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');

    // THEN
    expect(response.status).toBe(200);
  });
  it('GET /utilisateurs/id - 403 si on accede à la ressource d un autre', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { email: '1' });
    await TestUtil.create(DB.utilisateur, { id: 'autre-id', email: '2' });
    const response = await TestUtil.GET('/utilisateurs/autre-id');
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual('002');
    expect(response.body.message).toEqual(
      'Vous ne pouvez pas accéder à ces données',
    );
  });
  it('GET /utilisateurs/id - when present', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { failed_login_count: 2 });
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('utilisateur-id');
    expect(response.body.nom).toEqual('nom');
    expect(response.body.prenom).toEqual('prenom');
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.commune).toEqual('Palaiseau');
    expect(response.body.revenu_fiscal).toEqual(10000);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2);
    expect(response.body.created_at).toEqual(dbUser.created_at.toISOString());
    expect(response.body.failed_login_count).toEqual(undefined); // donnée cachée
    expect(response.body.prevent_login_before).toEqual(undefined); // donnée cachée
    expect(response.body.fonctionnalites_debloquees).toEqual(['aides']);
  });
  it('GET /utilisateurs/id - part fiscale estimée', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      failed_login_count: 2,
      parts: null,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
    // THEN
    expect(response.body.nombre_de_parts_fiscales).toEqual(2.5);
  });

  it('POST /utilisateurs/login - logs user and return a JWT token', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.token.length).toBeGreaterThan(20);

    expect(response.body.utilisateur.id).toEqual('utilisateur-id');
    expect(response.body.utilisateur.nom).toEqual('nom');
    expect(response.body.utilisateur.prenom).toEqual('prenom');
    expect(response.body.utilisateur.code_postal).toEqual('91120');
    expect(response.body.utilisateur.commune).toEqual('Palaiseau');
    expect(response.body.utilisateur.revenu_fiscal).toEqual(10000);
    expect(response.body.utilisateur.nombre_de_parts_fiscales).toEqual(2.5); // valeur estimée depuis l'onboarding
  });
  it('POST /utilisateurs/login - bad password', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
    expect(dbUser.failed_login_count).toEqual(1);
  });
  it('POST /utilisateurs/login - utilisateur non actif', async () => {
    // GIVEN
    let response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'w@w.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    expect(response.status).toBe(201);

    // WHEN
    response = await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#1234567890HAHA',
      email: 'w@w.com',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Utilisateur non actif');
  });
  it('POST /utilisateurs/login - bad password twice, failed count = 2', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(dbUser.failed_login_count).toEqual(3);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
  });
  it('POST /utilisateurs/login - bad password twice then ok, resets login count', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(response.status).toEqual(200);
    expect(dbUser.failed_login_count).toEqual(0);
  });
  it('POST /utilisateurs/login - bad password 4 times, blocked account', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // THEN
    expect(response.body.message).toContain(
      `Trop d'essais successifs, compte bloqué jusqu'à`,
    );
    expect(dbUser.failed_login_count).toEqual(4); // le compteur reste bloqué sur 4
    expect(dbUser.prevent_login_before.getTime()).toBeGreaterThan(
      new Date().getTime(),
    );
  });
  it('POST /utilisateurs/login - bad email', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'bademail@truc.com',
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
  });

  it('GET /utilisateurs/id/profile - read basic profile datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nom).toEqual('nom');
    expect(response.body.prenom).toEqual('prenom');
    expect(response.body.email).toEqual('yo@truc.com');
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.commune).toEqual('Palaiseau');
    expect(response.body.revenu_fiscal).toEqual(10000);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2);
    expect(response.body.abonnement_ter_loire).toEqual(false);
    expect(response.body.onboarding_result).toEqual({
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    });
  });
  it('GET /utilisateurs/id/logement - read logement datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      code_postal: '11111',
      commune: 'Patelin',
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.dpe).toEqual(DPE.B);
    expect(response.body.superficie).toEqual(Superficie.superficie_150);
    expect(response.body.type).toEqual(TypeLogement.maison);
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.chauffage).toEqual(Chauffage.bois);
    expect(response.body.commune).toEqual('PALAISEAU');
    expect(response.body.nombre_adultes).toEqual(2);
    expect(response.body.nombre_enfants).toEqual(2);
    expect(response.body.plus_de_15_ans).toEqual(true);
    expect(response.body.proprietaire).toEqual(true);
  });
  it('GET /utilisateurs/id/logement - read logement datas et prio sur donnee commune code postal utilisateur', async () => {
    // GIVEN
    const user = await TestUtil.create(DB.utilisateur, {
      code_postal: '11111',
      commune: 'Patelin',
      logement: {},
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.code_postal).toEqual('11111');
    expect(response.body.commune).toEqual('Patelin');
  });
  it('GET /utilisateurs/id/profile - use onboarding data when missing parts in user account', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { parts: null });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2.5);
  });
  it('GET /utilisateurs/id/profile - default to 1 when no onboarding data', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      parts: null,
      onboardingData: {},
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nombre_de_parts_fiscales).toEqual(1);
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas without password', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      code_postal: '75008',
      commune: 'Versailles',
      revenu_fiscal: 12345,
      nombre_de_parts_fiscales: 3,
      abonnement_ter_loire: true,
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      code_postal: '75008',
      commune: 'Versailles',
      mot_de_passe: '123456789012#',
      revenu_fiscal: 12345,
      nombre_de_parts_fiscales: 3,
      abonnement_ter_loire: true,
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const fakeUser = getFakeUtilisteur();
    fakeUser.passwordHash = dbUser.passwordHash;
    fakeUser.passwordSalt = dbUser.passwordSalt;
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
    expect(dbUser.commune).toEqual('Versailles');
    expect(dbUser.revenu_fiscal).toEqual(12345);
    expect(dbUser.parts.toNumber()).toEqual(3);
    expect(dbUser.abonnement_ter_loire).toEqual(true);
    expect(dbUser.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('123456789012#', dbUser.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
  });
  it('PATCH /utilisateurs/id/logement - update logement datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      nombre_adultes: 4,
      nombre_enfants: 0,
      code_postal: '11111',
      commune: 'Patelin',
      type: TypeLogement.appartement,
      superficie: Superficie.superficie_35,
      proprietaire: false,
      chauffage: Chauffage.electricite,
      plus_de_15_ans: false,
      dpe: DPE.E,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id');
    expect(dbUser.code_postal).toEqual('11111');
    expect(dbUser.commune).toEqual('Patelin');
    expect(dbUser.logement.code_postal).toEqual('11111');
    expect(dbUser.logement.commune).toEqual('Patelin');
    expect(dbUser.logement.nombre_adultes).toEqual(4);
    expect(dbUser.logement.nombre_enfants).toEqual(0);
    expect(dbUser.logement.type).toEqual(TypeLogement.appartement);
    expect(dbUser.logement.superficie).toEqual(Superficie.superficie_35);
    expect(dbUser.logement.proprietaire).toEqual(false);
    expect(dbUser.logement.plus_de_15_ans).toEqual(false);
    expect(dbUser.logement.chauffage).toEqual(Chauffage.electricite);
    expect(dbUser.logement.dpe).toEqual(DPE.E);
  });
  it('PATCH /utilisateurs/id/profile - bad password format', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      mot_de_passe: 'bad',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Le mot de passe doit contenir au moins un chiffre',
    );
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi OK si mail existe pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const response = await TestUtil.POST(
      '/utilisateurs/oubli_mot_de_passe',
    ).send({
      email: 'mailpas@connu.com',
    });
    // THEN
    expect(response.status).toBe(200);
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi KO si 4 demandes de suite', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    const response = await TestUtil.POST(
      '/utilisateurs/oubli_mot_de_passe',
    ).send({
      email: 'yo@truc.com',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Trop d'essais successifs, attendez jusqu'à ",
    );
  });

  it('POST /utilisateurs/modifier_mot_de_passe - si code ok le mot de passe est modifié, compteurs à zero', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: '123456',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.failed_checkcode_count).toEqual(0);
    expect(userDB.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('#1234567890HAHA', userDB.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
    expect(userDB.sent_email_count).toEqual(0);
    expect(userDB.failed_login_count).toEqual(0);
    expect(userDB.prevent_login_before.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko le mot de passe est PAS modifié', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const userDB_before = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(userDB.passwordHash).toEqual(userDB_before.passwordHash);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si email ko erreur generique', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const userDB_before = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: '123456',
        mot_de_passe: '#1234567890HAHA',
        email: 'bad@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(userDB.passwordHash).toEqual(userDB_before.passwordHash);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko 4 fois, blocage', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Trop d'essais successifs, attendez jusqu'à ",
    );
  });
});
