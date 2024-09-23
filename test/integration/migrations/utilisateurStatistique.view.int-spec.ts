import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { DB, TestUtil } from '../../TestUtil';

describe('UtilisateurView', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('create la vue UtilisateurStatistique', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur1',
      email: 'user1@dev.com',
      created_at: new Date(2024, 0, 1),
      derniere_activite: new Date(2024, 0, 2),
      points_classement: 4321,
      rank: 2,
      source_inscription: 'inconnue',
      couverture_aides_ok: true,
      rank_commune: 1,
      logement: new Logement({
        code_postal: '22000',
        commune: 'St Brieuc',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 3,
        plus_de_15_ans: false,
        version: 0,
        proprietaire: true,
        superficie: Superficie.superficie_100,
        type: TypeLogement.appartement,
        chauffage: Chauffage.electricite,
      }),
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur2',
      email: 'user2@dev.com',
      created_at: new Date(2024, 0, 2),
      points_classement: 2222,
      rank: 25,
      rank_commune: 11,
      source_inscription: 'web',
      couverture_aides_ok: false,
      logement: {
        code_postal: '13000',
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: 'idUtilisateur3',
      email: 'user3@dev.com',
      created_at: new Date(2024, 0, 3),
      points_classement: 1111,
      rank: 2,
      rank_commune: 1,
      logement: {
        code_postal: '75018',
      },
    });

    // WHEN
    const utilisateurVue = await TestUtil.prisma.utilisateurVue.findMany();

    // THEN
    expect(utilisateurVue).toStrictEqual([
      {
        id: 1704063600,
        code_postal: '22000',
        classement_global: 2,
        classement_local: 1,
        couverture_aide: true,
        nombre_points: 4321,
        source_inscription: 'inconnue',
        date_derniere_connexion: new Date(2024, 0, 2),
        date_inscription: new Date(2024, 0, 1),
        commune: 'St Brieuc',
        dpe: 'B',
        nombre_adultes: 2,
        nombre_enfants: 3,
        plus_de_15_ans: false,
        proprietaire: true,
        superficie: Superficie.superficie_100,
        type: TypeLogement.appartement,
        chauffage: Chauffage.electricite,
      },
      {
        id: 1704150000,
        code_postal: '13000',
        classement_global: 25,
        classement_local: 11,
        couverture_aide: false,
        nombre_points: 2222,
        source_inscription: 'web',
        date_derniere_connexion: null,
        date_inscription: new Date(2024, 0, 2),
        commune: null,
        dpe: null,
        nombre_adultes: null,
        nombre_enfants: null,
        plus_de_15_ans: null,
        proprietaire: null,
        superficie: null,
        type: null,
        chauffage: null,
      },
      {
        id: 1704236400,
        code_postal: '75018',
        classement_global: 2,
        classement_local: 1,
        couverture_aide: false,
        nombre_points: 1111,
        source_inscription: 'web',
        date_derniere_connexion: null,
        date_inscription: new Date(2024, 0, 3),
        commune: null,
        dpe: null,
        nombre_adultes: null,
        nombre_enfants: null,
        plus_de_15_ans: null,
        proprietaire: null,
        superficie: null,
        type: null,
        chauffage: null,
      },
    ]);
  });
});
