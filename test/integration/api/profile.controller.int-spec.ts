import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { TransportQuotidien } from '../../../src/domain/transport/transport';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Univers } from '../../../src/domain/univers/univers';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
var crypto = require('crypto');

function getFakeUtilisteur() {
  return {
    id: null,
    passwordHash: '',
    passwordSalt: '',
    failed_login_count: 0,
    prevent_login_before: new Date(),
    force_connexion: false,
  };
}

describe('/utilisateurs - Compte utilisateur (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

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
    expect(response.body.fonctionnalites_debloquees).toEqual([
      'aides',
      'defis',
    ]);
  });
  it('GET /utilisateurs/id/profile - part fiscale estimée', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      failed_login_count: 2,
      parts: null,
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
    // THEN
    //expect(response.body.nombre_de_parts_fiscales).toEqual(2.5);
    expect(response.body.nombre_de_parts_fiscales).toEqual(1);
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
    expect(response.body.annee_naissance).toEqual(1979);
    expect(response.body.email).toEqual('yo@truc.com');
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.commune).toEqual('PALAISEAU');
    expect(response.body.revenu_fiscal).toEqual(10000);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2);
    expect(response.body.abonnement_ter_loire).toEqual(false);
    /*
    expect(response.body.onboarding_result).toEqual({
      alimentation: Impact.tres_faible,
      transports: Impact.faible,
      logement: Impact.eleve,
      consommation: Impact.tres_eleve,
    });
    */
  });
  it('GET /utilisateurs/id/logement - read logement datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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
  it('GET /utilisateurs/id/transport - read transport datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/transport',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.transports_quotidiens).toEqual([
      TransportQuotidien.velo,
      TransportQuotidien.voiture,
    ]);
    expect(response.body.avions_par_an).toEqual(2);
  });
  /**
  it('GET /utilisateurs/id/profile - use onboarding data when missing parts in user account', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { parts: null });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2.5);
  });
  */
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
      annee_naissance: 1234,
      mot_de_passe: '123456789012#aA',
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
    expect(dbUser.annee_naissance).toEqual(1234);
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.revenu_fiscal).toEqual(12345);
    expect(dbUser.parts.toNumber()).toEqual(3);
    expect(dbUser.abonnement_ter_loire).toEqual(true);
    expect(dbUser.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('123456789012#aA', dbUser.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
  });
  it('PATCH /utilisateurs/id/logement - update logement datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC006,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });

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
    expect(dbUser.commune_classement).toEqual('Patelin');
    expect(dbUser.code_postal_classement).toEqual('11111');
  });
  it('PATCH /utilisateurs/id/logement - update KYC006 si logement plus 15 ans', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      code: KYCID.KYC006,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      plus_de_15_ans: true,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id');
    const catalogue = await kycRepository.getAllDefs();
    dbUser.kyc_history.setCatalogue(catalogue);

    const question = dbUser.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC006,
    );
    expect(question.hasAnyResponses());
    expect(question.includesReponseCode('plus_15'));
  });
  it('PATCH /utilisateurs/id/transport - update transport datas and reco tags', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID._2,
      type: TypeReponseQuestionKYC.choix_multiple,
      categorie: Categorie.test,
      points: 10,
      question: 'Comment avez vous connu le service ?',
      reponses: [
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
    });
    // WHEN
    let response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/transport',
    ).send({
      avions_par_an: 1,
      transports_quotidiens: [TransportQuotidien.pied],
    });
    // THEN
    expect(response.status).toBe(200);
    let dbUser = await utilisateurRepository.getById('utilisateur-id');

    expect(dbUser.transport.avions_par_an).toEqual(1);
    expect(dbUser.transport.transports_quotidiens).toEqual([
      TransportQuotidien.pied,
    ]);
    expect(dbUser.tag_ponderation_set.utilise_moto_ou_voiture).toEqual(0);
    // WHEN
    response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/transport',
    ).send({
      avions_par_an: 1,
      transports_quotidiens: [TransportQuotidien.voiture],
    });
    // THEN
    expect(response.status).toBe(200);
    dbUser = await utilisateurRepository.getById('utilisateur-id');
    expect(dbUser.tag_ponderation_set.utilise_moto_ou_voiture).toEqual(100);
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

  it(`POST /utilisateurs/id/reset reset d'un utilisateur donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.service);
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/reset',
    ).send({
      confirmation: 'CONFIRMATION RESET',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    const servicesDB = await TestUtil.prisma.service.findMany();
    const servicesDefDB = await TestUtil.prisma.serviceDefinition.findMany();

    // THEN
    expect(response.status).toBe(201);
    expect(userDB.unlocked_features.unlocked_features).toHaveLength(3);
    expect(servicesDB).toHaveLength(0);
    expect(servicesDefDB).toHaveLength(1);
  });

  it(`POST /utilisateurs/id/reset reset tous les utilisateurs`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { id: '1', email: '1' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: '2' });

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/reset').send({
      confirmation: 'CONFIRMATION RESET',
    });

    const userDB1 = await utilisateurRepository.getById('1');
    const userDB2 = await utilisateurRepository.getById('2');

    // THEN
    expect(response.status).toBe(201);
    expect(userDB1.unlocked_features.unlocked_features).toHaveLength(3);
  });
  it(`POST /utilisateurs/id/reset erreur si pas la bonne phrase de confirmation`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/reset',
    ).send({
      confirmation: 'haha',
    });

    // THEN
    expect(response.status).toBe(400);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.unlocked_features.unlocked_features).toHaveLength(2);
  });
  it(`POST /utilisateurs/id/reset erreur si pas de payload`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/utilisateur-id/reset');

    // THEN
    expect(response.status).toBe(400);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.unlocked_features.unlocked_features).toHaveLength(2);
  });

  it(`GET /utilisateurs/id/onboarding_status renvoie le status OK quand aucune réponse`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      nom: null,
      prenom: null,
      logement: {},
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/onboarding_status',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.current).toEqual(1);
    expect(response.body.target).toEqual(3);
    expect(response.body.current_label).toEqual('prenom');
    expect(response.body.is_done).toEqual(false);
  });
  it(`GET /utilisateurs/id/onboarding_status prenom OK`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      nom: null,
      prenom: 'George',
      logement: {},
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/onboarding_status',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.current).toEqual(2);
    expect(response.body.target).toEqual(3);
    expect(response.body.current_label).toEqual('code postal');
    expect(response.body.is_done).toEqual(false);
  });
  it(`GET /utilisateurs/id/onboarding_status code postal OK`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      nom: null,
      prenom: 'George',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/onboarding_status',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.current).toEqual(3);
    expect(response.body.target).toEqual(3);
    expect(response.body.current_label).toEqual('interêts');
    expect(response.body.is_done).toEqual(false);
  });
  it(`GET /utilisateurs/id/onboarding_status terminé`, async () => {
    // GIVEN
    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_questions: [
        {
          id: KYCID.KYC001,
          id_cms: 2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
          ],
          tags: [],
          universes: [Univers.climat],
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      nom: null,
      prenom: 'George',
      kyc: kyc,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/onboarding_status',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.current).toEqual(3);
    expect(response.body.target).toEqual(3);
    expect(response.body.current_label).toEqual('onboarding terminé');
    expect(response.body.is_done).toEqual(true);
  });
});
