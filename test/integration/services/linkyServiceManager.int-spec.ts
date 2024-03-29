import { DB, TestUtil } from '../../TestUtil';
import { ServiceRepository } from '../../../src/infrastructure/repository/service.repository';
import { DepartementRepository } from '../../../src/infrastructure/repository/departement/departement.repository';
import { LinkyRepository } from '../../../src/infrastructure/repository/linky.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { LinkyServiceManager } from '../../../src/infrastructure/service/linky/LinkyServiceManager';
import {
  Service,
  ServiceData,
  ServiceStatus,
} from '../../../src/domain/service/service';
import {
  LiveService,
  ServiceDefinitionData,
} from '../../../src/domain/service/serviceDefinition';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import {
  Superficie,
  TypeLogement,
  Chauffage,
  DPE,
} from '../../../src/domain/utilisateur/logement';

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
};
const SERVICE_DEF_DATA: ServiceDefinitionData = {
  serviceDefinitionId: 'dummy_live',
  titre: 'titre',
  url: 'url',
  icon_url: 'icon_url',
  image_url: 'image_url',
  is_local: true,
  is_url_externe: true,
  minute_period: 20,
  scheduled_refresh: null,
  dynamic_data: null,
  last_refresh: null,
  description: 'desc',
  sous_description: 'sous desc',
  parametrage_requis: true,
  thematiques: [Thematique.climat, Thematique.logement],
  nombre_installation: 0,
  is_installed: true,
};

const SERVICE_DATA = {
  serviceId: 'service-id',
  utilisateurId: 'utilisateur-id',
  serviceDefinitionId: 'dummy_live',
  configuration: {},
  status: ServiceStatus.CREATED,
};

describe('linkyServiceManager', () => {
  let serviceRepository = new ServiceRepository(TestUtil.prisma);
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let departementRepository = new DepartementRepository();
  let linkyEmailer = {
    sendConfigurationKOEmail: jest.fn(),
    sendAvailableDataEmail: jest.fn(),
  };
  let linkyAPIConnector = {
    souscription_API: jest.fn(),
    deleteSouscription: jest.fn(),
  };

  let linkyRepository = new LinkyRepository(TestUtil.prisma);

  let linkyServiceManager = new LinkyServiceManager(
    serviceRepository,
    utilisateurRepository,
    departementRepository,
    linkyEmailer,
    linkyRepository,
    linkyAPIConnector,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    linkyEmailer.sendAvailableDataEmail.mockReset();
    linkyEmailer.sendConfigurationKOEmail.mockReset();
    linkyAPIConnector.deleteSouscription.mockReset();
    linkyAPIConnector.souscription_API.mockReset();

    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('computeLiveDynamicData : PRM invalide 032', async () => {
    // GIVEN

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceId: 'service-id',
      configuration: { error_code: '032' },
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual('⚠️ PRM incorrect, mettez le à jour !');
    expect(result.isInError).toEqual(true);
  });
  it('computeLiveDynamicData : PRM invalide 039', async () => {
    // GIVEN
    const serviceDefData = TestUtil.serviceDefinitionData();
    const serviceData = TestUtil.serviceData();

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: { error_code: '039' },
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual('⚠️ PRM incorrect, mettez le à jour !');
    expect(result.isInError).toEqual(true);
  });
  it('computeLiveDynamicData : prm manquant', async () => {
    // GIVEN
    const serviceDefData = TestUtil.serviceDefinitionData();
    const serviceData = TestUtil.serviceData();

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: {},
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual('🔌 configurez Linky');
  });
  it('computeLiveDynamicData : prm présent mais pas live', async () => {
    // GIVEN
    const serviceDefData = TestUtil.serviceDefinitionData();
    const serviceData = TestUtil.serviceData();

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: { prm: '12345678901234' },
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual(`🔌 Vos données sont en chemin !`);
  });
  it('computeLiveDynamicData : prm présent et live', async () => {
    // GIVEN
    const serviceDefData = TestUtil.serviceDefinitionData();
    const serviceData = TestUtil.serviceData();

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: { prm: '12345678901234', live_prm: '12345678901234' },
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual('🔌 Vos données sont en chemin !');
  });
  it('computeLiveDynamicData : prm présent, live, et premieres données dispo', async () => {
    // GIVEN
    const serviceDefData = TestUtil.serviceDefinitionData();
    const serviceData = TestUtil.serviceData();

    await TestUtil.create(DB.linky, { prm: '12345678901234' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: { prm: '12345678901234', live_prm: '12345678901234' },
    });

    // WHEN
    const result = await linkyServiceManager.computeLiveDynamicData(service);

    // THEN
    expect(result.label).toEqual(`🔴 jeudi +10%`);
  });
  it('processConfiguration :positionne la date de consentement et de fin de consentement à + 3 ans', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const def = { id: LiveService.linky };
    const serviceDef = {
      serviceDefinitionId: LiveService.linky,
      configuration: {},
      status: ServiceStatus.CREATED,
    };
    await TestUtil.create(DB.serviceDefinition, def);
    await TestUtil.create(DB.service, serviceDef);
    let service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    // WHEN
    await linkyServiceManager.processAndUpdateConfiguration(service);

    // THEN
    service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    expect(
      new Date(service.configuration['date_consent']).getTime(),
    ).toBeGreaterThan(Date.now() - 100);
    expect(
      new Date(service.configuration['date_consent']).getTime(),
    ).toBeLessThan(Date.now() + 100);
    expect(
      new Date(service.configuration['date_fin_consent']).getTime(),
    ).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 24 * 1090);
    expect(
      new Date(service.configuration['date_fin_consent']).getTime(),
    ).toBeLessThan(Date.now() + 1000 * 60 * 60 * 24 * 1100);
  });
  it(`processConfiguration : supprime l'état en erreur d'une conf précédentee`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const def = { id: LiveService.linky };
    const serviceDef = {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        error_code: '123',
        error_message: 'bad',
      },
      status: ServiceStatus.LIVE,
    };
    await TestUtil.create(DB.serviceDefinition, def);
    await TestUtil.create(DB.service, serviceDef);
    let service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    // WHEN
    await linkyServiceManager.processAndUpdateConfiguration(service);

    service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    // THEN
    expect(service.configuration['error_code']).toBeUndefined();
    expect(service.configuration['error_message']).toBeUndefined();
  });
  it(`processConfiguration : lance une erreur 032 si erreur 032, mais d'email d'erreur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const def = { id: LiveService.linky };
    const serviceDef = {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    };
    await TestUtil.create(DB.serviceDefinition, def);
    await TestUtil.create(DB.service, serviceDef);
    const service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '032', message: 'aie' };
    });

    // WHEN
    try {
      await linkyServiceManager.processAndUpdateConfiguration(service);
      throw new Error('it should not reach here');
    } catch (error) {
      // THEN
      expect(error.code).toEqual('032');
      expect(linkyEmailer.sendConfigurationKOEmail).toBeCalledTimes(0);
    }
  });
  it(`processConfiguration : lance une erreur 039 si erreur 039, mais d'email d'erreur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const def = { id: LiveService.linky };
    const serviceDef = {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    };
    await TestUtil.create(DB.serviceDefinition, def);
    await TestUtil.create(DB.service, serviceDef);
    const service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '039', message: 'aie' };
    });

    // WHEN
    try {
      await linkyServiceManager.processAndUpdateConfiguration(service);
      throw new Error('it should not reach here');
    } catch (error) {
      // THEN
      expect(error.code).toEqual('039');
      expect(linkyEmailer.sendConfigurationKOEmail).toBeCalledTimes(0);
    }
  });
  it(`processConfiguration : silencieux si erreur pas 032 ou 039`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const def = { id: LiveService.linky };
    const serviceDef = {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    };
    await TestUtil.create(DB.serviceDefinition, def);
    await TestUtil.create(DB.service, serviceDef);
    let service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '123', message: 'aie' };
    });

    // WHEN
    await linkyServiceManager.processAndUpdateConfiguration(service);

    // THEN
    service = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      'linky',
    );

    // pas d'erreur
    expect(service.getErrorCode()).toEqual('123');
  });
  it('activateService : pas PRM => error', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      configuration: {},
    });

    const user = await utilisateurRepository.getById('utilisateur-id');

    // WHEN
    const result = await linkyServiceManager.activateService(service, user);

    // THEN
    expect(result).toContain('ERROR');
  });
  it('activateService : si deja un PRM live égal au nouveau PRM de conf, le service CREATED repasse LIVE', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
      },
      status: ServiceStatus.CREATED,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123', live_prm: '123' },
    });

    // WHEN
    const result = await linkyServiceManager.activateService(service, user);

    // THEN
    expect(result).toContain('PREVIOUSLY LIVE');
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    expect(serviceDB.status).toEqual(ServiceStatus.LIVE);
  });
  it('activateService : cas passant du service linky qui renvoie une winter_pk', async () => {
    // GIVEN
    linkyAPIConnector.souscription_API.mockReturnValue('pk_123');

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
    });

    // WHEN
    const result = await linkyServiceManager.activateService(service, user);

    // THEN
    expect(result).toContain('INITIALISED');
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linky_data = await linkyRepository.getByPRM('123');

    expect(linky_data.serie).toHaveLength(0);
    expect(linky_data.utilisateurId).toEqual('utilisateur-id');

    expect(serviceDB.configuration['winter_pk']).toEqual('pk_123');
    expect(serviceDB.configuration['live_prm']).toEqual('123');
    expect(serviceDB.configuration['departement']).toEqual('91');

    expect(linkyEmailer.sendConfigurationKOEmail).toBeCalledTimes(0);
    expect(linkyAPIConnector.souscription_API).toBeCalledTimes(1);
  });
  it(`activateService : ne soumet pas l'activation si une erreur 032 en cours`, async () => {
    // GIVEN
    linkyAPIConnector.souscription_API.mockReturnValue('pk_123');

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        error_code: '032',
        error_message: 'aie aie',
      },
      status: ServiceStatus.CREATED,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        error_code: '032',
        error_message: 'aie aie',
      },
    });

    // WHEN
    const result = await linkyServiceManager.activateService(service, user);

    // THEN
    expect(result).toContain('SKIP');
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    expect(serviceDB.configuration['error_code']).toEqual('032');
    expect(serviceDB.configuration['error_message']).toEqual('aie aie');
    expect(linkyAPIConnector.souscription_API).toBeCalledTimes(0);
  });

  it('activateService : re init une ancienne erreur', async () => {
    // GIVEN
    linkyAPIConnector.souscription_API.mockReturnValue('pk_123');

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        error_code: '12345',
        error_message: 'aie aie',
      },
      status: ServiceStatus.CREATED,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        error_code: '12345',
        error_message: 'aie aie',
      },
    });

    // WHEN
    const result = await linkyServiceManager.activateService(service, user);

    // THEN
    expect(result).toContain('INITIALISED');
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    expect(serviceDB.configuration['error_code']).toBeUndefined();
    expect(serviceDB.configuration['error_message']).toBeUndefined();
    expect(linkyAPIConnector.souscription_API).toBeCalledTimes(1);
  });
  it('activateService : Une exception est consignée dans la configuration', async () => {
    // GIVEN
    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '11', message: 'aie' };
    });

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
    });

    // WHEN
    try {
      await linkyServiceManager.activateService(service, user);
    } catch (error) {
      expect(error.code).toEqual('11');
      expect(error.message).toEqual('aie');
    }

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    expect(serviceDB.configuration['error_code']).toEqual('11');
    expect(serviceDB.configuration['error_message']).toEqual('aie');
    expect(serviceDB.configuration['departement']).toBeUndefined();
    expect(serviceDB.configuration['winter_pk']).toBeUndefined();
    expect(serviceDB.configuration['live_prm']).toBeUndefined();
    expect(serviceDB.status).toEqual(ServiceStatus.CREATED);
    expect(linkyEmailer.sendConfigurationKOEmail).not.toBeCalled();
  });
  it('removeService : cas passant, supprime le service et les données linky', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        winter_pk: 'abc',
      },
      status: ServiceStatus.TO_DELETE,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    await TestUtil.create(DB.linky, {
      prm: '123',
    });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123', winter_pk: 'abc' },
    });

    // WHEN
    const result = await linkyServiceManager.removeService(service, user);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linkyDB = await linkyRepository.getByPRM('123)');

    expect(result).toContain('DELETED');
    expect(serviceDB).toBeNull();
    expect(linkyDB).toBeNull();
    expect(linkyAPIConnector.deleteSouscription).toBeCalledTimes(1);
  });
  it(`removeService : si API répond déjà supprimé, supprime bien le serrvice et les data`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        winter_pk: 'abc',
      },
      status: ServiceStatus.TO_DELETE,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        winter_pk: 'abc',
      },
    });

    linkyAPIConnector.deleteSouscription.mockImplementation(() => {
      throw { code: '037', message: 'aie' };
    });

    // WHEN
    const result = await linkyServiceManager.removeService(service, user);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linkyDB = await linkyRepository.getByPRM('123)');

    expect(result).toContain('ALREADY DELETED');
    expect(serviceDB).toBeNull();
    expect(linkyDB).toBeNull();
    expect(linkyAPIConnector.deleteSouscription).toBeCalledTimes(1);
  });
  it(`removeService : ne tente pas de supprimer via API si erreur courrante 037, en revanche supprime bien le serrvice et les data`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        winter_pk: 'abc',
        error_code: '037',
      },
      status: ServiceStatus.TO_DELETE,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        winter_pk: 'abc',
        error_code: '037',
      },
    });

    // WHEN
    const result = await linkyServiceManager.removeService(service, user);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linkyDB = await linkyRepository.getByPRM('123)');

    expect(result).toContain('ALREADY DELETED');
    expect(serviceDB).toBeNull();
    expect(linkyDB).toBeNull();
    expect(linkyAPIConnector.deleteSouscription).toBeCalledTimes(0);
  });
  it('removeService : Une exception est consignée dans la configuration', async () => {
    // GIVEN
    linkyAPIConnector.deleteSouscription.mockImplementation(() => {
      throw { code: '11', message: 'aie' };
    });

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.TO_DELETE,
    });
    const user = await utilisateurRepository.getById('utilisateur-id');

    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
    });

    // WHEN
    try {
      await linkyServiceManager.removeService(service, user);
      fail();
    } catch (error) {
      expect(error.code).toEqual('11');
      expect(error.message).toEqual('aie');
    }

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linkyDB = await linkyRepository.getByPRM('123');

    expect(linkyDB).not.toBeNull();
    expect(serviceDB.configuration['error_code']).toEqual('11');
    expect(serviceDB.configuration['error_message']).toEqual('aie');
    expect(serviceDB.status).toEqual(ServiceStatus.TO_DELETE);
  });
  it('runAsyncProcessing :service LIVE => rien à faire', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
      },
      status: ServiceStatus.LIVE,
    });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123', live_prm: '123' },
      status: ServiceStatus.LIVE,
    });

    // WHEN
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    expect(result).toContain('ALREADY LIVE');
  });
  it('runAsyncProcessing :service CREATED => activation', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
      status: ServiceStatus.CREATED,
    });

    // WHEN
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );

    expect(result).toContain('INITIALISED');
    expect(result).not.toContain('true');
    expect(serviceDB.status).toEqual(ServiceStatus.LIVE);
  });
  it('runAsyncProcessing :service CREATED => erreur 032 => envoie de mail', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    });
    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '032', message: 'aie' };
    });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
      status: ServiceStatus.CREATED,
    });

    // WHEN
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );

    expect(result).toContain('ERROR CREATING');
    expect(result).not.toContain('true');
    expect(serviceDB.status).toEqual(ServiceStatus.CREATED);
    expect(linkyEmailer.sendConfigurationKOEmail).toBeCalledTimes(1);
  });
  it(`runAsyncProcessing : double traitement en erreur n'envoie pas deux fois le mail`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
      },
      status: ServiceStatus.CREATED,
    });
    linkyAPIConnector.souscription_API.mockImplementation(() => {
      throw { code: '032', message: 'aie' };
    });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123' },
      status: ServiceStatus.CREATED,
    });

    // WHEN
    let result = await linkyServiceManager.runAsyncProcessing(service);
    result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );

    expect(result).toContain('SKIP');
    expect(result).not.toContain('true');
    expect(serviceDB.status).toEqual(ServiceStatus.CREATED);
    expect(linkyEmailer.sendConfigurationKOEmail).toBeCalledTimes(1);
  });
  it('runAsyncProcessing :service TO_DELETE => suppression du service', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
        sent_data_email: true,
      },
      status: ServiceStatus.TO_DELETE,
    });
    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123', live_prm: '123', sent_data_email: true },
      status: ServiceStatus.TO_DELETE,
    });

    // WHEN
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );
    const linkyDB = await linkyRepository.getByPRM('123');

    expect(result).toContain('DELETED');
    expect(result).not.toContain('true');
    expect(serviceDB).toBeNull();
    expect(linkyDB).toBeNull();
  });
  it('runAsyncProcessing : présence de donnee declenche envoi mail', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
      },
      status: ServiceStatus.LIVE,
    });
    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: LiveService.linky,
      configuration: { prm: '123', live_prm: '123' },
      status: ServiceStatus.LIVE,
    });

    // WHEN
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );

    expect(result).toContain('ALREADY LIVE');
    expect(result).toContain('true');
    expect(serviceDB.configuration['sent_data_email']).toEqual(true);
    expect(linkyEmailer.sendAvailableDataEmail).toBeCalled();
  });
  it('runAsyncProcessing : pas de doublon mail', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.serviceDefinition, { id: LiveService.linky });
    await TestUtil.create(DB.service, {
      serviceDefinitionId: LiveService.linky,
      configuration: {
        prm: '123',
        live_prm: '123',
      },
      status: ServiceStatus.LIVE,
    });
    await TestUtil.create(DB.linky, { prm: '123' });

    const service = new Service({
      ...SERVICE_DEF_DATA,
      ...SERVICE_DATA,
      serviceDefinitionId: 'linky',
      configuration: { prm: '123', live_prm: '123' },
      status: ServiceStatus.LIVE,
    });

    // WHEN
    await linkyServiceManager.runAsyncProcessing(service);
    const result = await linkyServiceManager.runAsyncProcessing(service);

    // THEN
    const serviceDB = await serviceRepository.getServiceOfUtilisateur(
      'utilisateur-id',
      LiveService.linky,
    );

    expect(result).toContain('ALREADY LIVE');
    expect(result).toContain('false');
    expect(serviceDB.configuration['sent_data_email']).toEqual(true);
    expect(linkyEmailer.sendAvailableDataEmail).toBeCalledTimes(1);
  });
});
