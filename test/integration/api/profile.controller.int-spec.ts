import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { NiveauRisqueLogement } from '../../../src/domain/logement/NiveauRisque';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Tag_v2 } from '../../../src/domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
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
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      `Cet utilisateur n'existe plus, veuillez vous reconnecter`,
    );
  });
  it('DELETE /utilisateurs/id', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.serviceDefinition);
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

  it(`DELETE /utilisateurs/id supprime un utilisateur france connecté`, async () => {
    // GIVEN
    process.env.OIDC_URL_LOGOUT_CALLBACK = '/logout-callback';
    process.env.BASE_URL_FRONT = 'http://localhost:3000';
    process.env.OIDC_URL_LOGOUT =
      'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout';

    await TestUtil.create(DB.utilisateur, { france_connect_sub: '123' });
    await TestUtil.create(DB.OIDC_STATE);

    // WHEN
    const response = await TestUtil.DELETE('/utilisateurs/utilisateur-id');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.france_connect_logout_url).toContain(
      'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout?id_token_hint=456&state=',
    );
    expect(response.body.france_connect_logout_url).toContain(
      '&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogout-callback',
    );
  });

  it('DELETE /admin/utilisateurs/id en mode admin', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.situationNGC);
    await TestUtil.create(DB.serviceDefinition);
    await TestUtil.create(DB.thematique);

    // WHEN
    const response = await TestUtil.DELETE(
      '/admin/utilisateurs/utilisateur-id',
    );

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
    expect(response.body.popup_reset_est_vue).toEqual(false);
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
    expect(response.body.mois_naissance).toEqual(3);
    expect(response.body.jour_naissance).toEqual(24);
    expect(response.body.email).toEqual('yo@truc.com');
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.commune).toEqual('PALAISEAU');
    expect(response.body.revenu_fiscal).toEqual(10000);
    expect(response.body.nombre_de_parts_fiscales).toEqual(2);
    expect(response.body.abonnement_ter_loire).toEqual(false);
    expect(response.body.is_nom_prenom_modifiable).toEqual(true);
    expect(response.body.popup_reset_est_vue).toEqual(false);

    expect(response.body.pseudo).toEqual('pseudo');
  });
  it('GET /utilisateurs/id/logement - read logement datas', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '12345',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      chauffage: 'bois',
      code_postal: '91120',
      commune: 'PALAISEAU',
      commune_label: 'Palaiseau',
      dpe: 'B',
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      superficie: 'superficie_150',
      type: 'maison',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '12345',
    });
  });

  it('GET /utilisateurs/id/logement - absence de risque', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '12345',

      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      chauffage: 'bois',
      code_postal: '91120',
      commune: 'PALAISEAU',
      commune_label: 'Palaiseau',
      dpe: 'B',
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      superficie: 'superficie_150',
      type: 'maison',
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '12345',
    });
  });

  it('GET /utilisateurs/id/logement - pousse code_commune niveau utilisateur si celui de logement est absent', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '23456',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.code_commune).toEqual('23456');
  });

  it('GET /utilisateurs/id/logement - aucun code commune', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/logement',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.code_commune).toBeUndefined();
  });

  it('GET /utilisateurs/id/profile - default to 1 when no logement data', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      parts: null,
      logement: {},
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
      annee_naissance: 1920,
      mois_naissance: 5,
      jour_naissance: 25,
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas with null data pour adress', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: {
        argile: NiveauRisqueLogement.faible,
        inondation: NiveauRisqueLogement.fort,
        radon: NiveauRisqueLogement.moyen,
        secheresse: NiveauRisqueLogement.tres_faible,
        submersion: NiveauRisqueLogement.faible,
        seisme: NiveauRisqueLogement.tres_fort,
        tempete: NiveauRisqueLogement.fort,
      },
      prm: undefined,
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      code_commune: '21231',
      longitude: null,
      latitude: null,
      numero_rue: null,
      rue: null,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.logement.longitude).toEqual(null);
    expect(dbUser.logement.latitude).toEqual(null);
    expect(dbUser.logement.numero_rue).toEqual(null);
    expect(dbUser.logement.rue).toEqual(null);
    expect(dbUser.logement.score_risques_adresse).toEqual({});
  });
  it('PATCH /utilisateurs/id/profile - prenom trop long', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      prenom:
        'AaAaaaaaaehfbgsqflkqdhsfvqsdlmkhsdvkjhvksdhfkjghqsdflkqhsfvsdlkghsdlkfgh',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `L'attribut [prenom] doit être de longueur maximale 40, longueur reçue : 72`,
    );
  });
  it('PATCH /utilisateurs/id/profile - nom trop long', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nom: 'AaAaaaaaaehfbgsqflkqdhsfvqsdlmkhsdvkjhvksdhfkjghqsdflkqhsfvsdlkghsdlkfgh',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `L'attribut [nom] doit être de longueur maximale 40, longueur reçue : 72`,
    );
  });
  it('PATCH /utilisateurs/id/profile - pas possible de maj le email', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'HAHAHAHe@paris.com',
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(dbUser.email).toEqual('yo@truc.com');
  });
  it('PATCH /utilisateurs/id/profile - que du alpha dans nom', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nom: 'TOTO35',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('067');
  });
  it('PATCH /utilisateurs/id/profile - prenom pas alpha => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      prenom: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('068');
  });
  it('PATCH /utilisateurs/id/profile - pseudo pas alpha ni num => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      pseudo: 'haha45!!!',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('118');
  });
  it('PATCH /utilisateurs/id/profile - pseudo pas alpha & num OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      pseudo: 'haha45',
    });
    // THEN
    expect(response.status).toBe(200);
  });
  it('PATCH /utilisateurs/id/profile - RFR non entier => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      revenu_fiscal: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('073');
  });
  it('PATCH /utilisateurs/id/profile - Annee naissance non entier => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      annee_naissance: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('075');
  });
  it('PATCH /utilisateurs/id/profile - Annee naissance trop petite', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      annee_naissance: '100',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('075');
  });
  it('PATCH /utilisateurs/id/profile - mois naissance non entier => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      mois_naissance: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('128');
  });
  it('PATCH /utilisateurs/id/profile - mois naissance trop grand', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      mois_naissance: '123',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('128');
  });
  it('PATCH /utilisateurs/id/profile - jour naissance non entier => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      jour_naissance: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('129');
  });
  it('PATCH /utilisateurs/id/profile - jour naissance trop grand', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      jour_naissance: '123',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('129');
  });
  it('PATCH /utilisateurs/id/profile - parts fiscal non decimal erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: 'haha45',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('074');
  });
  it('PATCH /utilisateurs/id/profile - parts fiscal avec . ou virgule OK ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '2.5',
    });
    // THEN
    expect(response.status).toBe(200);

    let userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.parts).toEqual(2.5);

    const response2 = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '2,5',
    });
    // THEN
    expect(response2.status).toBe(200);
    userDB = await utilisateurRepository.getById('utilisateur-id', [Scope.ALL]);
    expect(userDB.parts).toEqual(2.5);
  });
  it('PATCH /utilisateurs/id/profile - parts fiscal trop petite ou tros grande', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '0',
    });
    // THEN
    expect(response.status).toBe(400);

    const response2 = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '123',
    });
    // THEN
    expect(response2.status).toBe(400);
  });
  it('PATCH /utilisateurs/id/profile - parts fiscal trop de chiffres apres la virgule', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '2.45',
    });
    // THEN
    expect(response.status).toBe(400);
  });
  it('PATCH /utilisateurs/id/profile - parts fiscal valeur entière OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nombre_de_parts_fiscales: '2',
    });
    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.parts).toEqual(2);
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { est_valide_pour_classement: true });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      annee_naissance: 1930,
      mois_naissance: 5,
      jour_naissance: 23,
      mot_de_passe: '123456789012#aA',
      revenu_fiscal: 12345,
      nombre_de_parts_fiscales: 3,
      abonnement_ter_loire: true,
      pseudo: 'hahah',
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
    expect(dbUser.pseudo).toEqual('hahah');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.annee_naissance).toEqual(1930);
    expect(dbUser.mois_naissance).toEqual(5);
    expect(dbUser.jour_naissance).toEqual(23);
    expect(dbUser.revenu_fiscal).toEqual(12345);
    expect(dbUser.parts.toNumber()).toEqual(3);
    expect(dbUser.abonnement_ter_loire).toEqual(true);
    expect(dbUser.est_valide_pour_classement).toEqual(false);
    expect(dbUser.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('123456789012#aA', dbUser.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
  });
  it('GET /utilisateurs/id/profile boolean nom_prenom_non_modifiable', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.is_nom_prenom_modifiable).toEqual(false);
  });
  it('PATCH /utilisateurs/id/profile - bloque update nom si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      nom: 'THE NOM',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté",
    );
  });
  it('PATCH /utilisateurs/id/profile - bloque update prenom si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      prenom: 'THE PRENOM',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté",
    );
  });
  it('PATCH /utilisateurs/id/profile - bloque update annee naissance si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      annee_naissance: 1979,
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté",
    );
  });
  it('PATCH /utilisateurs/id/profile - bloque update mois naissance si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      mois_naissance: 5,
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté",
    );
  });
  it('PATCH /utilisateurs/id/profile - bloque update jour naissance si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      jour_naissance: 23,
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté",
    );
  });
  it('PATCH /utilisateurs/id/profile - bloque update nom si FC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      france_connect_sub: '123',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      prenom: 'haha',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `Impossible de mettre à jour nom/prenom/date de naissance d'un utilisatueur France Connecté`,
    );
  });
  it('PATCH /utilisateurs/id/profile - le pseudo est valide si un autre utilisateur avec même pseudo valide existe', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: '1',
      est_valide_pour_classement: true,
      pseudo: 'pseudo OK',
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'utilisateur-id',
      email: '2',
      est_valide_pour_classement: false,
      pseudo: 'Insulte',
    });
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      pseudo: 'pseudo OK',
    });
    expect(response.status).toEqual(200);

    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUser.est_valide_pour_classement).toEqual(true);
  });
  it('PATCH /utilisateurs/id/logement - update logement datas et synchro KYCs', async () => {
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
      question: 'Age maison',
      reponses: [
        { label: 'Moins de 15 ans (neuf ou récent)', code: 'moins_15' },
        { label: 'Plus de 15 ans (ancien)', code: 'plus_15' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 3,
      code: KYCID.KYC_DPE,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'DPE',
      reponses: [
        { label: 'A', code: 'A' },
        { label: 'E', code: 'E' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 4,
      code: KYCID.KYC_superficie,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      points: 10,
      question: 'Superficie',
      reponses: [],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 5,
      code: KYCID.KYC_proprietaire,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'Prop',
      reponses: [
        { label: 'A', code: 'oui' },
        { label: 'B', code: 'non' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 61,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_chauffage_fioul,
      is_ngc: true,
      points: 10,
      question: 'The question !',
      tags: [],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'OUI', code: 'oui', ngc_code: '_oui' },
        { label: 'NON', code: 'non', ngc_code: '_non' },
        { label: 'Ne sais pas', code: 'ne_sais_pas' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 62,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_chauffage_bois,
      is_ngc: true,
      points: 10,
      question: 'The question !',
      tags: [],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'OUI', code: 'oui', ngc_code: '_oui' },
        { label: 'NON', code: 'non', ngc_code: '_non' },
        { label: 'Ne sais pas', code: 'ne_sais_pas' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 63,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_chauffage_elec,
      is_ngc: true,
      points: 10,
      question: 'The question !',
      tags: [],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'OUI', code: 'oui', ngc_code: '_oui' },
        { label: 'NON', code: 'non', ngc_code: '_non' },
        { label: 'Ne sais pas', code: 'ne_sais_pas' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 64,
      categorie: Categorie.recommandation,
      code: KYCID.KYC_chauffage_gaz,
      is_ngc: true,
      points: 10,
      question: 'The question !',
      tags: [],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'OUI', code: 'oui', ngc_code: '_oui' },
        { label: 'NON', code: 'non', ngc_code: '_non' },
        { label: 'Ne sais pas', code: 'ne_sais_pas' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 7,
      code: KYCID.KYC_type_logement,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.test,
      points: 10,
      question: 'KYC_type_logement',
      reponses: [
        { label: 'A', code: 'type_appartement' },
        { label: 'B', code: 'type_maison' },
      ],
    });
    await TestUtil.create(DB.kYC, {
      id_cms: 8,
      code: KYCID.KYC_menage,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      points: 10,
      question: 'KYC_menage',
      reponses: [],
    });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      nombre_adultes: 4,
      nombre_enfants: 1,
      code_postal: '21000',
      commune: 'DIJON',
      type: TypeLogement.appartement,
      superficie: Superficie.superficie_35,
      proprietaire: false,
      chauffage: Chauffage.electricite,
      plus_de_15_ans: false,
      dpe: DPE.E,
      code_commune: '21231',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(dbUser.logement.code_postal).toEqual('21000');
    expect(dbUser.logement.commune).toEqual('Dijon');
    expect(dbUser.logement.nombre_adultes).toEqual(4);
    expect(dbUser.logement.nombre_enfants).toEqual(1);
    expect(dbUser.logement.type).toEqual(TypeLogement.appartement);
    expect(dbUser.logement.superficie).toEqual(Superficie.superficie_35);
    expect(dbUser.logement.proprietaire).toEqual(false);
    expect(dbUser.logement.plus_de_15_ans).toEqual(false);
    expect(dbUser.logement.chauffage).toEqual(Chauffage.electricite);
    expect(dbUser.logement.dpe).toEqual(DPE.E);
    expect(dbUser.code_commune_classement).toEqual('21231');

    // KYCs
    expect(
      dbUser.kyc_history.getQuestion(KYCID.KYC_DPE).getSelectedCode(),
    ).toEqual('E');
    expect(
      dbUser.kyc_history.getQuestionNumerique(KYCID.KYC_superficie).getValue(),
    ).toEqual(34);
    expect(
      dbUser.kyc_history.getQuestion(KYCID.KYC_proprietaire).getSelectedCode(),
    ).toEqual('non');
    expect(
      dbUser.kyc_history
        .getQuestion(KYCID.KYC_chauffage_elec)
        .getSelectedCode(),
    ).toEqual('oui');
    expect(
      dbUser.kyc_history
        .getQuestion(KYCID.KYC_chauffage_bois)
        .getSelectedCode(),
    ).toEqual('ne_sais_pas');
    expect(
      dbUser.kyc_history.getQuestion(KYCID.KYC_type_logement).getSelectedCode(),
    ).toEqual('type_appartement');
    expect(
      dbUser.kyc_history.getQuestionNumerique(KYCID.KYC_menage).getValue(),
    ).toEqual(5);
  });

  it('PATCH /utilisateurs/id/logement - update logement datas et synchro KYC logement age', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      is_ngc: true,
      code: KYCID.KYC_logement_age,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      ngc_key: 'a . b .c',
      points: 10,
      question: 'Age maison',
      reponses: [],
    });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      plus_de_15_ans: false,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // KYCs
    expect(
      dbUser.kyc_history
        .getQuestionNumerique(KYCID.KYC_logement_age)
        .getValue(),
    ).toEqual(5);
  });
  it('PATCH /utilisateurs/id/logement - update code_commune => update tag urbain', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_commune: '91477',
      code_postal: '91120',
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // KYCs
    expect(dbUser.recommandation.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_urbaine,
    ]);
  });
  it('PATCH /utilisateurs/id/logement - update logement datas et synchro KYC logement age supp', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.kYC, {
      id_cms: 2,
      is_ngc: true,
      code: KYCID.KYC_logement_age,
      type: TypeReponseQuestionKYC.entier,
      categorie: Categorie.test,
      ngc_key: 'a . b .c',
      points: 10,
      question: 'Age maison',
      reponses: [],
    });
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      plus_de_15_ans: true,
    });

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // KYCs
    expect(
      dbUser.kyc_history
        .getQuestionNumerique(KYCID.KYC_logement_age)
        .getValue(),
    ).toEqual(20);
  });

  it('PATCH /utilisateurs/id/logement - maj code postal recalcul le flag de couverture d aides', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { couverture_aides_ok: false });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'],
    });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.couverture_aides_ok).toEqual(true);
  });

  it('PATCH /utilisateurs/id/logement - maj rue, num rue, long et lat', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      rue: 'rue du soleil',
      numero_rue: '13bis',
      longitude: 1,
      latitude: 43.7,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.logement.rue).toEqual('rue du soleil');
    expect(dbUser.logement.numero_rue).toEqual('13bis');
    expect(dbUser.logement.longitude).toEqual(1);
    expect(dbUser.logement.latitude).toEqual(43.7);
  });

  it('PATCH /utilisateurs/id/logement - maj code postal positionne le code insee de la commune', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.logement.code_commune).toEqual('21231');
  });
  it('PATCH /utilisateurs/id/logement - maj code commune surcharge le reste', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      commune: 'DIJON',
      code_commune: '21231',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.logement.code_commune).toEqual('21231');
    expect(dbUser.logement.commune).toEqual('Dijon');
    expect(dbUser.logement.code_postal).toEqual('21000'); // code postal lui pas touché car on peut pas retoruver un unique code postal à partir d'un code commune
  });
  it('PATCH /utilisateurs/id/logement - code postal de moins de 5 char => erreur', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '1234',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('077');
  });
  it('PATCH /utilisateurs/id/logement - code postal pas entier', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: 'hahah',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('077');
  });
  it('PATCH /utilisateurs/id/logement - code postal sans commune', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('078');
  });
  it('PATCH /utilisateurs/id/logement - code postal avec code_commune sans label commune => OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      code_commune: '21231',
    });
    // THEN
    expect(response.status).toBe(200);
  });
  it('PATCH /utilisateurs/id/logement - code postal avec code_commune pas compatible OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      code_commune: '91477',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Le code postal [21000] ne correspond pas à la commune [91477]`,
    );
  });
  it('PATCH /utilisateurs/id/logement - commune sans code postal', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('078');
  });
  it('PATCH /utilisateurs/id/logement - commune qui match pas le code postal', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '91120',
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('079');
  });
  it('PATCH /utilisateurs/id/logement - code postal inconnu', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '99999',
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toEqual('079');
  });

  it('PATCH /utilisateurs/id/logement - exception silencieuse si KYC de synchro échoue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      nombre_adultes: 4,
      nombre_enfants: 1,
      code_postal: '21000',
      commune: 'DIJON',
      type: TypeLogement.appartement,
      superficie: Superficie.superficie_35,
      proprietaire: false,
      chauffage: Chauffage.electricite,
      plus_de_15_ans: false,
      dpe: DPE.E,
    });
    // THEN
    expect(response.status).toBe(200);
  });

  it('PATCH /utilisateurs/id/logement - maj code postal recalcul le flag de couverture d aides', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { couverture_aides_ok: false });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'],
    });

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      code_postal: '21000',
      commune: 'DIJON',
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.couverture_aides_ok).toEqual(true);
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
    await kycRepository.loadCache();

    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/logement',
    ).send({
      plus_de_15_ans: true,
    });
    // THEN
    expect(response.status).toBe(200);
    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    dbUser.kyc_history.setCatalogue(KycRepository.getCatalogue());

    const question = dbUser.kyc_history.getQuestionChoixUnique(KYCID.KYC006);
    expect(question.isAnswered());
    expect(question.isSelected('plus_15'));
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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    const servicesDB = await TestUtil.prisma.service.findMany();
    const servicesDefDB = await TestUtil.prisma.serviceDefinition.findMany();

    // THEN
    expect(response.status).toBe(201);
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

    const userDB1 = await utilisateurRepository.getById('1', [Scope.ALL]);

    // THEN
    expect(response.status).toBe(201);
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
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
  });
  it(`POST /utilisateurs/id/reset erreur si pas de payload`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/utilisateur-id/reset');

    // THEN
    expect(response.status).toBe(400);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
  });
  it(`POST /utilisateurs/update_user_couverture`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    const logement_91120: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: undefined,
    };
    const logement_21000: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'DIJON',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: '1',
      couverture_aides_ok: false,
      logement: logement_91120 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: '2',
      couverture_aides_ok: false,
      logement: logement_91120 as any,
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: '3',
      couverture_aides_ok: false,
      logement: logement_21000 as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['91120'],
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/update_user_couverture',
    );

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      couvert: 2,
      pas_couvert: 1,
    });

    let userDB = await utilisateurRepository.getById('1', [Scope.ALL]);
    expect(userDB.couverture_aides_ok).toEqual(true);

    userDB = await utilisateurRepository.getById('3', [Scope.ALL]);
    expect(userDB.couverture_aides_ok).toEqual(false);
  });

  it(`PUT /utilisateurs/id/mobile_token ajoute le token pour l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/mobile_token',
    ).send({
      token: 'haha',
    });

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual('haha');
    expect(userDB.mobile_token_updated_at.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it(`PUT /utilisateurs/id/mobile_token enleve le token d'un utilisateur précédent`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: '1',
      mobile_token: 'haha',
      mobile_token_updated_at: new Date(1),
    });
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/mobile_token',
    ).send({
      token: 'haha',
    });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await utilisateurRepository.getById('1', [Scope.ALL]);
    expect(userDB.mobile_token).toEqual(null);
    expect(userDB.mobile_token_updated_at.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it(`DELETE /utilisateurs/id/mobile_token supprime le token pour l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { mobile_token: 'hihi' });

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/mobile_token',
    );

    // THEN
    expect(response.status).toBe(200);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual(null);
    expect(userDB.mobile_token_updated_at.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
});
