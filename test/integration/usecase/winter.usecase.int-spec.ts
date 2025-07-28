import { TypeAction } from '../../../src/domain/actions/typeAction';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { EmailSender } from '../../../src/infrastructure/email/emailSender';
import { Personnalisator } from '../../../src/infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { AideRepository } from '../../../src/infrastructure/repository/aide.repository';
import { AideExpirationWarningRepository } from '../../../src/infrastructure/repository/aideExpirationWarning.repository';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from '../../../src/infrastructure/repository/compteurActions.repository';
import { LinkyConsentRepository } from '../../../src/infrastructure/repository/linkyConsent.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { RisquesNaturelsCommunesRepository } from '../../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { MaifRepository } from '../../../src/infrastructure/repository/services_recherche/maif/maif.repository';
import { MaifAPIClient } from '../../../src/infrastructure/repository/services_recherche/maif/maifAPIClient';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { AidesUsecase } from '../../../src/usecase/aides.usecase';
import { CatalogueActionUsecase } from '../../../src/usecase/catalogue_actions.usecase';
import { LogementUsecase } from '../../../src/usecase/logement.usecase';
import { PartenaireUsecase } from '../../../src/usecase/partenaire.usecase';
import { WinterUsecase } from '../../../src/usecase/winter.usecase';
import { DB, TestUtil } from '../../TestUtil';

const TROIS_ANS = 1000 * 60 * 60 * 24 * 365 * 3;

describe('WinterUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let linkyConsentRepository = new LinkyConsentRepository(TestUtil.prisma);
  let actionRepository = new ActionRepository(TestUtil.prisma);
  let aideRepository = new AideRepository(TestUtil.prisma);
  let partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  let communeRepository = new CommuneRepository(TestUtil.prisma);
  let emailSender = new EmailSender();
  let personalisator = new Personnalisator(communeRepository);
  let aideExpirationWarningRepository = new AideExpirationWarningRepository(
    TestUtil.prisma,
  );
  let partenaireUsecase = new PartenaireUsecase(communeRepository);
  let compteurActionsRepository = new CompteurActionsRepository(
    TestUtil.prisma,
  );
  let aidesUsecase = new AidesUsecase(
    aideExpirationWarningRepository,
    emailSender,
    aideRepository,
    partenaireRepository,
    utilisateurRepository,
    personalisator,
    partenaireUsecase,
  );
  let catalogueActionUsecase = new CatalogueActionUsecase(
    actionRepository,
    compteurActionsRepository,
    aideRepository,
    aidesUsecase,
    communeRepository,
    utilisateurRepository,
  );
  let maifAPIClient = new MaifAPIClient();
  let risquesNaturelsCommunesRepository = new RisquesNaturelsCommunesRepository(
    TestUtil.prisma,
  );
  let maifRepository = new MaifRepository(communeRepository, maifAPIClient);

  let logementUsecase = new LogementUsecase(
    utilisateurRepository,
    aideRepository,
    communeRepository,
    maifRepository,
    risquesNaturelsCommunesRepository,
  );

  let winterRepository = {
    rechercherPRMParAdresse: jest.fn(),
    inscrirePRM: jest.fn(),
    listerActionsWinter: jest.fn(),
    supprimerPRM: jest.fn(),
  };

  let winterUsecase = new WinterUsecase(
    utilisateurRepository,
    winterRepository as any,
    actionRepository,
    logementUsecase,
    linkyConsentRepository,
    catalogueActionUsecase,
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

  it('connect_by_address : Connexion par adresse en argument OK, suppression PRM dejà existant', async () => {
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
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    winterRepository.rechercherPRMParAdresse.mockImplementation(() => {
      return '12345';
    });

    // WHEN
    await winterUsecase.inscrireAdresse(
      'utilisateur-id',
      {
        code_commune: '91477',
        code_postal: '91120',
        latitude: 42,
        longitude: 2,
        nom: 'SMITH',
        numero_rue: '20',
        rue: 'rue de la paix',
      },
      '127.0.0.1',
      'chrome',
    );

    // THEN
    expect(winterRepository.supprimerPRM).toHaveBeenCalledTimes(1);
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
      'chrome',
      'v1',
    );

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual('12345');
    expect(user.logement.est_prm_par_adresse).toEqual(true);

    const consent = (await TestUtil.prisma.linkyConsentement.findMany())[0];

    const date_consentement = consent.date_consentement;
    const date_fin_consentement = consent.date_fin_consentement;
    const id = consent.id;

    delete consent.created_at;
    delete consent.updated_at;
    delete consent.date_consentement;
    delete consent.date_fin_consentement;
    delete consent.id;

    expect(consent).toEqual({
      email: 'yo@truc.com',
      ip_address: '127.0.0.1',
      nom: 'SMITH',
      prm: '12345',
      texte_signature: `En activant le suivi,
je déclare sur l'honneur être titulaire du compteur électrique ou être mandaté par celui-ci.
J'autorise J'Agis et son partenaire Watt Watchers à recueillir mon historique de consommation d'électricité sur 3 ans (demi-heure, journée et puissance maximum quotidienne),
ainsi qu'à analyser mes consommations tant que j'ai un compte`,
      user_agent: 'chrome',
      utilisateurId: 'utilisateur-id',
    });

    expect(id).toHaveLength(36);
    expect(date_consentement.getTime()).toBeGreaterThan(Date.now() - 200);
    expect(date_fin_consentement.getTime()).toBeGreaterThan(
      Date.now() + TROIS_ANS - 200,
    );
  });

  it('connect_by_address : missing name', async () => {
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
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        {
          code_commune: '91477',
          code_postal: '91120',
          latitude: 42,
          longitude: 2,
          nom: undefined,
          numero_rue: '20',
          rue: 'rue de la paix',
        },
        '127.0.0.1',
        'chrome',
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual('Nom obligatoire');
    }

    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(0);
    expect(winterRepository.inscrirePRM).toHaveBeenCalledTimes(0);

    const consent = await TestUtil.prisma.linkyConsentement.findMany();
    expect(consent).toHaveLength(0);
  });
  it('connect_by_address : missing adresse', async () => {
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
      numero_rue: undefined,
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        {
          code_commune: '91477',
          code_postal: '91120',
          latitude: 42,
          longitude: 2,
          nom: 'SMITH',
          numero_rue: undefined,
          rue: 'rue de la paix',
        },
        '127.0.0.1',
        'chrome',
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Adresse (numéro de rue et rue) manquante pour la recherche de PRM',
      );
    }

    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(0);
    expect(winterRepository.inscrirePRM).toHaveBeenCalledTimes(0);

    const consent = await TestUtil.prisma.linkyConsentement.findMany();
    expect(consent).toHaveLength(0);
  });
  it('connect_by_address : missing code postal', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: undefined,
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        {
          code_commune: '91477',
          code_postal: undefined,
          latitude: 42,
          longitude: 2,
          nom: 'SMITH',
          numero_rue: '20',
          rue: 'rue de la paix',
        },
        '127.0.0.1',
        'chrome',
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le code postal ET la commune sont obligatoires',
      );
    }

    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(0);
    expect(winterRepository.inscrirePRM).toHaveBeenCalledTimes(0);

    const consent = await TestUtil.prisma.linkyConsentement.findMany();
    expect(consent).toHaveLength(0);
  });
  it('connect_by_address : missing code commune', async () => {
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
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        {
          code_commune: undefined,
          code_postal: '91120',
          latitude: 42,
          longitude: 2,
          nom: 'SMITH',
          numero_rue: '20',
          rue: 'rue de la paix',
        },
        '127.0.0.1',
        'chrome',
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le code postal ET la commune sont obligatoires',
      );
    }

    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(0);
    expect(winterRepository.inscrirePRM).toHaveBeenCalledTimes(0);

    const consent = await TestUtil.prisma.linkyConsentement.findMany();
    expect(consent).toHaveLength(0);
  });
  it('connect_by_address : pas de PRM trouvé', async () => {
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
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    winterRepository.rechercherPRMParAdresse.mockImplementation(() => {
      throw { message: 'not found' };
    });
    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        {
          code_commune: '91477',
          code_postal: '91120',
          latitude: 42,
          longitude: 2,
          nom: 'SMITH',
          numero_rue: '20',
          rue: 'rue de la paix',
        },
        '127.0.0.1',
        'chrome',
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual('not found');
    }

    expect(winterRepository.rechercherPRMParAdresse).toHaveBeenCalledTimes(1);
    expect(winterRepository.inscrirePRM).toHaveBeenCalledTimes(0);

    const consent = await TestUtil.prisma.linkyConsentement.findMany();
    expect(consent).toHaveLength(0);
  });
  it('refreshListeActions : integre correctement une action winter dans la liste de reco', async () => {
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
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: 'winter_123',
      type: TypeAction.classique,
      type_code_id: 'classique_winter_123',
      external_id: 'slug_123',
      partenaire_id: '455',
    });
    await actionRepository.loadCache();

    winterRepository.listerActionsWinter.mockImplementation(() => {
      return [
        {
          slug: 'slug_123',
          eligibility: 'eligible',
          economy: 10,
          status: 'not_started',
          type: 'ecogeste',
          usage: 'appliances',
        },
      ];
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // WHEN
    const result = await winterUsecase.external_update_winter_recommandation(
      userDB,
    );

    expect(winterRepository.listerActionsWinter).toHaveBeenCalledTimes(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      action: {
        code: 'winter_123',
        type: 'classique',
      },
      montant_economies_euro: 10,
    });
    expect(userDB.thematique_history.getNombreActionsWinter()).toEqual(1);
    expect(userDB.thematique_history.getRecommandationsWinter()).toEqual([
      {
        action: {
          code: 'winter_123',
          type: 'classique',
        },
        montant_economies_euro: 10,
      },
    ]);
  });
  it('refreshListeActions : pas de PRM => pas de reco', async () => {
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
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.action, {
      code: 'winter_123',
      type: TypeAction.classique,
      type_code_id: 'classique_winter_123',
      external_id: 'slug_123',
      partenaire_id: '455',
    });
    await actionRepository.loadCache();

    winterRepository.listerActionsWinter.mockImplementation(() => {
      return [
        {
          slug: 'slug_123',
          eligibility: 'eligible',
          economy: 10,
          status: 'not_started',
          type: 'ecogeste',
          usage: 'appliances',
        },
      ];
    });

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    // WHEN
    const result = await winterUsecase.external_update_winter_recommandation(
      userDB,
    );

    expect(winterRepository.listerActionsWinter).toHaveBeenCalledTimes(0);

    expect(result).toHaveLength(0);
    expect(userDB.thematique_history.getNombreActionsWinter()).toEqual(0);
  });
});
