import { DPE } from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterUsecase } from '../../../src/usecase/winter.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('WinterUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let communeRepository = new CommuneRepository(TestUtil.prisma);

  let winterRepository = {
    rechercherPRMParAdresse: jest.fn(),
    inscrirePRM: jest.fn(),
  };

  let winterUsecase = new WinterUsecase(
    utilisateurRepository,
    winterRepository as any,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    winterRepository.rechercherPRMParAdresse.mockReset();
    winterRepository.inscrirePRM.mockReset();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('connect_by_address : Connexion par adresse en argument OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {});

    winterRepository.rechercherPRMParAdresse.mockImplementation(() => {
      return '12345';
    });

    // WHEN
    await winterUsecase.connect_by_address(
      'utilisateur-id',
      'SMITH',
      '20 rue de la paix',
      '91120',
      '91477',
    );

    // THEN
    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(1);
    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledWith(
      'SMITH',
      '20 rue de la paix',
      '91477',
      '91120',
    );
    expect(winterRepository.inscrirePRM).toHaveBeenCalledWith(
      '12345',
      'SMITH',
      'utilisateur-id',
      '127.0.0.1',
      'agent',
      'v1',
    );

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual('12345');
  });
  it.skip('connect_by_address : Connexion par adresse', async () => {
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
      prm: undefined,
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
