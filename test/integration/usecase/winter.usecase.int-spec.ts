import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { LinkyConsentRepository } from '../../../src/infrastructure/repository/linkyConsent.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { WinterUsecase } from '../../../src/usecase/winter.usecase';
import { DB, TestUtil } from '../../TestUtil';

const TROIS_ANS = 1000 * 60 * 60 * 24 * 365 * 3;

describe('WinterUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let communeRepository = new CommuneRepository(TestUtil.prisma);
  let linkyConsentRepository = new LinkyConsentRepository(TestUtil.prisma);

  let winterRepository = {
    rechercherPRMParAdresse: jest.fn(),
    inscrirePRM: jest.fn(),
  };

  let winterUsecase = new WinterUsecase(
    utilisateurRepository,
    winterRepository as any,
    linkyConsentRepository,
    undefined,
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
    await winterUsecase.inscrireAdresse(
      'utilisateur-id',
      'SMITH',
      '20 rue de la paix',
      '91120',
      '91477',
      '127.0.0.1',
      'chrome',
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
      'chrome',
      'v1',
    );

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual('12345');

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
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        undefined,
        '20 rue de la paix',
        '91120',
        '91477',
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
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        'toto',
        undefined,
        '91120',
        '91477',
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
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        'toto',
        '20 rue de la paix',
        undefined,
        '91477',
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
    // GIVEN
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        'toto',
        '20 rue de la paix',
        '91120',
        undefined,
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
    await TestUtil.create(DB.utilisateur, {});
    winterRepository.rechercherPRMParAdresse.mockImplementation(() => {
      throw { message: 'not found' };
    });
    // WHEN
    try {
      await winterUsecase.inscrireAdresse(
        'utilisateur-id',
        'toto',
        '20 rue de la paix',
        '91120',
        '91477',
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
});
