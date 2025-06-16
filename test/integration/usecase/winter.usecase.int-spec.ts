import { DPE } from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterUsecase } from '../../../src/usecase/winter.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('WinterUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let communeRepository = new CommuneRepository(TestUtil.prisma);

  let winterUsecase = new WinterUsecase(utilisateurRepository);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('connect_by_address : Connexion par adresse', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      proprietaire: true,
      dpe: DPE.B,
      nombre_adultes: 2,
      code_postal: '21000',
      commune: 'Dijon',
      plus_de_15_ans: undefined,
      superficie: undefined,
      type: undefined,
      chauffage: undefined,
      latitude: undefined,
      longitude: undefined,
      nombre_enfants: undefined,
      numero_rue: undefined,
      rue: undefined,
      version: 0,
      code_commune: '21231',
      score_risques_adresse: undefined,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    const result = await winterUsecase.connect_by_address(
      'utilisateur-id',
      'SMITH',
      '20 rue de la paix',
      '91120',
      '91477',
    );

    // THEN
  });
});
