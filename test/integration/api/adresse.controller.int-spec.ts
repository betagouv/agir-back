import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { AdressesRecentesInputAPI } from '../../../src/infrastructure/api/types/utilisateur/adressesRecentesAPI';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/utilisateurs/adresses_recentes  (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

  it(`GET /utilisateurs/id/adresses_recentes - liste vide d'adresses recentes`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/adresses_recentes',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it(`GET /utilisateurs/id/adresses_recentes - liste une adresse`, async () => {
    // GIVEN
    const logement_91120: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
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
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: true,
      liste_adresses_recentes: [
        {
          code_commune: '21231',
          code_postal: '21000',
          id: '123',
          latitude: 40,
          longitude: 2,
          numero_rue: '16',
          rue: 'boulevard thiers',
          date_creation: new Date(1),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement_91120 as any });
    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/adresses_recentes',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      code_commune: '21231',
      code_postal: '21000',
      commmune: 'Dijon',
      id: '123',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
      date_creation: new Date(1).toISOString(),
    });
  });
  it(`POST /utilisateurs/id/adresses_recentes - crée une nouvelle adresse récente`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const payload: AdressesRecentesInputAPI = {
      code_commune: '21231',
      code_postal: '21000',
      id: '123',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
    };
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/adresses_recentes',
    ).send(payload);

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.logement,
    ]);
    expect(userDB.logement.liste_adresses_recentes).toHaveLength(1);

    const adresse = userDB.logement.liste_adresses_recentes[0];

    expect(adresse.date_creation.getTime()).toBeGreaterThan(Date.now() - 200);
    expect(adresse.id).toHaveLength(36);
    delete adresse.id;
    delete adresse.date_creation;

    expect(userDB.logement.liste_adresses_recentes[0]).toEqual({
      code_commune: '21231',
      code_postal: '21000',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
    });
  });
  it(`POST /utilisateurs/id/adresses_recentes - max 5 adresses`, async () => {
    // GIVEN
    const adresse_v0 = {
      code_commune: '21231',
      code_postal: '21000',
      id: '123',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
      date_creation: new Date(1),
    };
    const logement_91120: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
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
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: true,
      liste_adresses_recentes: [
        adresse_v0,
        adresse_v0,
        adresse_v0,
        adresse_v0,
        adresse_v0,
      ],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement_91120 as any });
    const payload: AdressesRecentesInputAPI = {
      code_commune: '21231',
      code_postal: '21000',
      id: '123',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
    };
    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/adresses_recentes',
    ).send(payload);

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `Il n'est pas possible d'avoir plus de [5] adresses récentes`,
    );
  });

  it(`DELETE /utilisateurs/id/adresses_recentes/id - supprime une adresse récente par ID`, async () => {
    // GIVEN
    const logement_91120: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
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
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: true,
      liste_adresses_recentes: [
        {
          code_commune: '21231',
          code_postal: '21000',
          id: '123',
          latitude: 40,
          longitude: 2,
          numero_rue: '16',
          rue: 'boulevard thiers',
          date_creation: new Date(1),
        },
        {
          code_commune: '21231',
          code_postal: '21000',
          id: '456',
          latitude: 40,
          longitude: 2,
          numero_rue: '16',
          rue: 'boulevard thiers',
          date_creation: new Date(1),
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement_91120 as any });
    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/adresses_recentes/123',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    expect(response.body[0]).toEqual({
      code_commune: '21231',
      code_postal: '21000',
      commmune: 'Dijon',
      date_creation: '1970-01-01T00:00:00.001Z',
      id: '456',
      latitude: 40,
      longitude: 2,
      numero_rue: '16',
      rue: 'boulevard thiers',
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.logement,
    ]);
    expect(userDB.logement.liste_adresses_recentes).toHaveLength(1);
    expect(userDB.logement.liste_adresses_recentes[0].id).toEqual('456');
  });
});
