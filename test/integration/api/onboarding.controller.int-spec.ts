import {
  Impact,
  Thematique,
} from '../../../src/domain/utilisateur/onboarding/onboarding';
import { TestUtil } from '../../TestUtil';

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
  ventilation_par_thematiques: {
    alimentation: Impact.tres_eleve,
    transports: Impact.eleve,
    logement: Impact.faible,
    consommation: Impact.tres_faible,
  },
  ventilation_par_impacts: {
    '1': [Thematique.consommation],
    '2': [Thematique.logement],
    '3': [Thematique.transports],
    '4': [Thematique.alimentation],
  },
};

describe('/utilisateurs - Onboarding - (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('POST /utilisateurs - create new utilisateur with given all data', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(response.status).toBe(201);
    expect(response.headers['location']).toContain('monmail@truc.com');
    expect(user.nom).toEqual('WW');
    expect(user.prenom).toEqual('Wojtek');
    expect(user.email).toEqual('monmail@truc.com');
    expect(user.code_postal).toEqual('91120');
    expect(user.commune).toEqual('Palaiseau');
    expect(user.email).toEqual('monmail@truc.com');
    expect(user.passwordHash.length).toBeGreaterThan(20);
    expect(user.passwordSalt.length).toBeGreaterThan(20);
    expect(user.onboardingData).toStrictEqual(ONBOARDING_1_2_3_4_DATA);
    expect(user.onboardingResult).toStrictEqual(ONBOARDING_RES_1234);
    expect(user.code).toHaveLength(6);
    expect(user.failed_checkcode_count).toEqual(0);
    expect(user.prevent_checkcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.sent_email_count).toEqual(1);
    expect(user.prevent_sendemail_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
  });
  it('POST /utilisateurs - bad password', async () => {
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
  it('POST /utilisateurs/renvoyer_code - resend code ok for first time, counter + 1', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    expect(userDB.sent_email_count).toEqual(2);
  });
  it('POST /utilisateurs/email/renvoyer_code - resend code 4 times => error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });

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
    await TestUtil.create('interactionDefinition');
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: userDB.code,
      });

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.utilisateur.id.length).toBeGreaterThan(15);
    expect(response.body.utilisateur.nom).toEqual('WW');
    expect(response.body.utilisateur.prenom).toEqual('Wojtek');
    expect(response.body.utilisateur.code_postal).toEqual('91120');
    expect(response.body.utilisateur.commune).toEqual('Palaiseau');
    expect(response.body.utilisateur.points).toEqual(0);
    expect(response.body.utilisateur.quizzProfile).toEqual({
      alimentation: { level: 1, isCompleted: false },
      transport: { level: 1, isCompleted: false },
      logement: { level: 1, isCompleted: false },
      consommation: { level: 1, isCompleted: false },
      climat: { level: 1, isCompleted: false },
      dechet: { level: 1, isCompleted: false },
      loisir: { level: 1, isCompleted: false },
    });
    expect(response.body.utilisateur.badges).toHaveLength(0);
    expect(response.body.utilisateur.todo.niveau).toEqual(1);

    userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    const userDB_interactions = await TestUtil.prisma.interaction.findMany();

    expect(userDB.active_account).toEqual(true);
    expect(userDB_interactions).toHaveLength(1);
    expect(userDB_interactions[0].utilisateurId).toEqual(userDB.id);
    expect(userDB.failed_login_count).toEqual(0);
    expect(userDB.prevent_login_before.getTime()).toBeLessThan(Date.now());
  });
  it('POST /utilisateurs/valider - validate 2 times , already active account error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    let userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: userDB.code,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
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
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: 'bad',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code ou adresse électronique');

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
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
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
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
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
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
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
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
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
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
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
    await TestUtil.create('utilisateur', { email: 'yo@truc.com' });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
        onboardingData: { ...ONBOARDING_1_2_3_4_DATA },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Adresse électronique yo@truc.com déjà existante',
    );
  });
  it('POST /utilisateurs - email au mauvais format', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHA',
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
});