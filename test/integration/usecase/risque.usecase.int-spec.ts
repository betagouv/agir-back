import { DPE } from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { RisquesUsecase } from '../../../src/usecase/risques.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('NotificationMobileUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let communeRepository = new CommuneRepository(TestUtil.prisma);
  let risquesNaturelsCommunesRepository = new RisquesNaturelsCommunesRepository(
    TestUtil.prisma,
  );

  let maifRepository = {
    findRisqueCommuneSynthese: jest.fn(),
  };

  let risquesUsecase = new RisquesUsecase(
    utilisateurRepository,
    risquesNaturelsCommunesRepository,
    communeRepository,
    maifRepository as any,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    maifRepository.findRisqueCommuneSynthese.mockReset();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('getRisquesCommuneUtilisateur : risques pas en cache pour la commune', async () => {
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
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    maifRepository.findRisqueCommuneSynthese.mockImplementation(() => {
      return {
        catnat: 1,
        pourcent_secheresse: 2.1,
        pourcent_inondation: 3.2,
      };
    });

    // WHEN
    const result = await risquesUsecase.getRisquesCommuneUtilisateur(
      'utilisateur-id',
    );

    // THEN
    expect(result).toEqual({
      code_commune: '21231',
      nom_commune: 'Dijon',
      nombre_cat_nat: 1,
      pourcentage_risque_innondation: 3,
      pourcentage_risque_secheresse: 2,
    });

    await risquesNaturelsCommunesRepository.loadCache();

    expect(maifRepository.findRisqueCommuneSynthese).toHaveBeenCalledTimes(1);

    const risques =
      risquesNaturelsCommunesRepository.getRisquesCommune('21231');
    expect(risques).toEqual({
      code_commune: '21231',
      nom_commune: 'Dijon',
      nombre_cat_nat: 1,
      pourcentage_risque_innondation: 3,
      pourcentage_risque_secheresse: 2,
    });
  });
  it('getRisquesCommuneUtilisateur : risques en cache pour la commune', async () => {
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
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    await TestUtil.create(DB.risquesNaturelsCommunes, {
      code_commune: '21231',
      nom_commune: 'Dijons',
      nombre_cat_nat: 2,
      pourcentage_inondation: 3,
      pourcentage_secheresse: 4,
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    const result = await risquesUsecase.getRisquesCommuneUtilisateur(
      'utilisateur-id',
    );

    // THEN
    expect(result).toEqual({
      code_commune: '21231',
      nom_commune: 'Dijons',
      nombre_cat_nat: 2,
      pourcentage_risque_innondation: 3,
      pourcentage_risque_secheresse: 4,
    });

    expect(maifRepository.findRisqueCommuneSynthese).toHaveBeenCalledTimes(0);
  });

  it('getRisquesCommuneUtilisateur : utilisation du code commune fourni en argument à la place de celui du profile utilisateur', async () => {
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
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    await TestUtil.create(DB.risquesNaturelsCommunes, {
      code_commune: '91477',
      nom_commune: 'Palaiseau',
      nombre_cat_nat: 2,
      pourcentage_inondation: 3,
      pourcentage_secheresse: 4,
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    const result = await risquesUsecase.getRisquesCommuneUtilisateur(
      'utilisateur-id',
      '91477',
    );

    // THEN
    expect(result).toEqual({
      code_commune: '91477',
      nom_commune: 'Palaiseau',
      nombre_cat_nat: 2,
      pourcentage_risque_innondation: 3,
      pourcentage_risque_secheresse: 4,
    });

    expect(maifRepository.findRisqueCommuneSynthese).toHaveBeenCalledTimes(0);
  });
  it('getRisquesCommuneUtilisateur : commune inconnue', async () => {
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
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    try {
      await risquesUsecase.getRisquesCommuneUtilisateur(
        'utilisateur-id',
        'bad',
      );
      fail();
    } catch (error) {
      expect(error.message).toEqual(
        `le code INSEE de commune [bad] n'existe pas`,
      );
    }
  });
  it('getRisquesCommuneUtilisateur : commune inconnue', async () => {
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
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };
    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
    });

    // WHEN
    try {
      await risquesUsecase.getRisquesCommuneUtilisateur(
        'utilisateur-id',
        'bad',
      );
      fail();
    } catch (error) {
      expect(error.message).toEqual(
        `le code INSEE de commune [bad] n'existe pas`,
      );
    }
  });
});
