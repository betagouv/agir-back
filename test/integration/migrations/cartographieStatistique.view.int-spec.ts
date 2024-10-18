import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { DB, TestUtil } from '../../TestUtil';

describe('CartographieView', () => {
  const OLD_ENV = process.env;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV };
    process.env.SERVICE_APIS_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('create la vue CartographieStatistique', async () => {
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
      annee_naissance: 1994,
      code_departement: '22',
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
      couverture_aides_ok: false,
      code_departement: '13',
      logement: {
        code_postal: '13000',
      },
    });

    // WHEN
    const cartographieVue = await TestUtil.prisma.cartographieVue.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    // THEN
    expect(cartographieVue).toStrictEqual([
      {
        id: 1,
        code_postal: '22000',
        couvert_par_aides: true,
        code_departement: '22',
      },
      {
        id: 2,
        code_postal: '13000',
        couvert_par_aides: false,
        code_departement: '13',
      },
    ]);
  });
});
