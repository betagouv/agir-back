import { Injectable } from '@nestjs/common';
import { ServiceDynamicData } from '../../../domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import { ServiceRepository } from '../../../../src/infrastructure/repository/service.repository';
import { AsyncServiceManager } from '../AsyncServiceManager';
import {
  Service,
  ServiceErrorKey,
  ServiceStatus,
} from '../../../../src/domain/service/service';
import { UtilisateurRepository } from '../../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DepartementRepository } from '../../../../src/infrastructure/repository/departement/departement.repository';
import { LinkyRepository } from '../../../../src/infrastructure/repository/linky.repository';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { LinkyAPIConnector } from './LinkyAPIConnector';
import { LinkyEmailer } from './LinkyEmailer';

const SENT_DATA_EMAIL_CONF_KEY = 'sent_data_email';
const PRM_CONF_KEY = 'prm';
const LIVE_PRM_CONF_KEY = 'live_prm';
const WINTER_PK_KEY = 'winter_pk';
const DEPARTEMENT_KEY = 'departement';
const DATE_CONSENT_KEY = 'date_consent';
const DATE_FIN_CONSENT_KEY = 'date_fin_consent';

const DUREE_CONSENT_ANNEES = 3;

@Injectable()
export class LinkyServiceManager
  implements LiveServiceManager, AsyncServiceManager
{
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly departementRepository: DepartementRepository,
    private readonly linkyEmailer: LinkyEmailer,
    private readonly linkyRepository: LinkyRepository,
    private readonly linkyAPIConnector: LinkyAPIConnector,
  ) {}
  async computeLiveDynamicData(service: Service): Promise<ServiceDynamicData> {
    const prm = service.configuration[PRM_CONF_KEY];
    if (this.isBadPRM(service)) {
      return {
        label: '⚠️ PRM invalide, reconfigurez le !',
        isInError: true,
      };
    }
    if (!(await this.isConfigured(service))) {
      return {
        label: '🔌 configurez Linky',
        isInError: false,
      };
    }
    if (
      (await this.isConfigured(service)) &&
      !(await this.isActivated(service))
    ) {
      return {
        label: `🔌 Linky en cours d'activation...`,
        isInError: false,
      };
    }
    const linky_data = await this.linkyRepository.getLinky(prm);

    if (!linky_data || linky_data.serie.length === 0) {
      return {
        label: '🔌 Vos données sont en chemin !',
        isInError: false,
      };
    }

    const last_value = linky_data.getLastRoundedValue();
    const pourcent = linky_data.getLastVariation();
    let couleur = pourcent <= 0 ? '🟢' : '🔴';
    let plus = pourcent > 0 ? '+' : '';
    return {
      label: `🔌 ${last_value} kWh ${couleur} ${plus}${pourcent}%`,
      isInError: false,
    };
  }

  private isBadPRM(service: Service) {
    return service.configuration[ServiceErrorKey.error_code] === '032';
  }

  async isConfigured(service: Service) {
    return !!service.configuration[PRM_CONF_KEY];
  }
  async isActivated(service: Service) {
    return !!service.configuration[LIVE_PRM_CONF_KEY];
  }
  async isFullyRunning(service: Service) {
    const empty = await this.linkyRepository.isPRMDataEmptyOrMissing(
      service.configuration[PRM_CONF_KEY],
    );
    return !empty;
  }

  processConfiguration(configuration: Object) {
    configuration[DATE_CONSENT_KEY] = new Date();

    const current_year = new Date().getFullYear();
    const end_date = new Date();
    end_date.setFullYear(current_year + DUREE_CONSENT_ANNEES);

    configuration[DATE_FIN_CONSENT_KEY] = end_date;
  }

  checkConfiguration(configuration: Object) {
    const prm = configuration[PRM_CONF_KEY];
    if (!prm) {
      ApplicationError.throwMissingPRM();
    }
    const regex = new RegExp('^[0-9]{14}$');
    if (!regex.test(prm)) {
      ApplicationError.throwBadPRM(prm);
    }
  }

  async runAsyncProcessing(service: Service): Promise<string> {
    const email_sent = await this.sendDataEmailIfNeeded(service);

    try {
      switch (service.status) {
        case ServiceStatus.LIVE:
          return `ALREADY LIVE : ${service.serviceDefinitionId} - ${service.serviceId} | data_email:${email_sent}`;
        case ServiceStatus.CREATED:
          return (await this.activateService(service)).concat(
            ` | data_email:${email_sent}`,
          );
        case ServiceStatus.TO_DELETE:
          return (await this.removeService(service)).concat(
            ` | data_email:${email_sent}`,
          );
        default:
          return `UNKNOWN STATUS : ${service.serviceDefinitionId} - ${service.serviceId} - ${service.status} | data_email:${email_sent}`;
      }
    } catch (error) {
      return `ERROR ${
        service.status === ServiceStatus.CREATED ? 'CREATING' : 'DELETING'
      }: ${service.serviceDefinitionId} - ${service.serviceId} : ${
        error.code
      }/${error.message} | data_email:${email_sent}`;
    }
  }

  async removeService(service: Service): Promise<string> {
    const winter_pk = service.configuration[WINTER_PK_KEY];
    const prm = service.configuration[PRM_CONF_KEY];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      service.utilisateurId,
    );

    try {
      await this.linkyAPIConnector.deleteSouscription(winter_pk);
      service.resetErrorState();
    } catch (error) {
      service.addErrorCodeToConfiguration(error.code);
      service.addErrorMessageToConfiguration(error.message);
      await this.serviceRepository.updateServiceConfiguration(
        utilisateur.id,
        service.serviceDefinitionId,
        service.configuration,
      );
      throw error;
    }

    await this.linkyRepository.deleteLinky(prm);

    await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      utilisateur.id,
      service.serviceDefinitionId,
    );

    return `DELETED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  async activateService(service: Service): Promise<string> {
    const prm = service.configuration[PRM_CONF_KEY];

    if (!prm) {
      return `ERROR : ${service.serviceDefinitionId} - ${service.serviceId} : missing prm data`;
    }

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      service.utilisateurId,
    );

    if (service.configuration[LIVE_PRM_CONF_KEY]) {
      if (
        service.configuration[LIVE_PRM_CONF_KEY] ===
        service.configuration[PRM_CONF_KEY]
      ) {
        await this.serviceRepository.updateServiceConfiguration(
          utilisateur.id,
          service.serviceDefinitionId,
          service.configuration,
          ServiceStatus.LIVE,
        );

        return `PREVIOUSLY LIVE : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
      }
    }

    const code_departement =
      this.departementRepository.findDepartementByCodePostal(
        utilisateur.code_postal,
      );

    let winter_pk;
    try {
      winter_pk = await this.linkyAPIConnector.souscription_API(
        prm,
        code_departement,
      );
      service.resetErrorState();
    } catch (error) {
      service.addErrorCodeToConfiguration(error.code);
      service.addErrorMessageToConfiguration(error.message);
      await this.serviceRepository.updateServiceConfiguration(
        utilisateur.id,
        service.serviceDefinitionId,
        service.configuration,
      );
      throw error;
    }

    service.configuration[WINTER_PK_KEY] = winter_pk;
    service.configuration[LIVE_PRM_CONF_KEY] = prm;
    service.configuration[DEPARTEMENT_KEY] = code_departement;

    await this.serviceRepository.updateServiceConfiguration(
      utilisateur.id,
      service.serviceDefinitionId,
      service.configuration,
      ServiceStatus.LIVE,
    );

    await this.linkyEmailer.sendConfigurationOKEmail(utilisateur);

    return `INITIALISED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  private async sendDataEmailIfNeeded(service: Service): Promise<boolean> {
    const sentDataEmail = service.configuration[SENT_DATA_EMAIL_CONF_KEY];
    if (!sentDataEmail) {
      const live_prm = service.configuration[LIVE_PRM_CONF_KEY];
      if (live_prm) {
        const utilisateur =
          await this.utilisateurRepository.findUtilisateurById(
            service.utilisateurId,
          );
        const linky_data = await this.linkyRepository.getLinky(live_prm);
        if (linky_data && linky_data.serie.length > 0) {
          await this.linkyEmailer.sendAvailableDataEmail(utilisateur);
          service.configuration[SENT_DATA_EMAIL_CONF_KEY] = true;
          await this.serviceRepository.updateServiceConfiguration(
            utilisateur.id,
            service.serviceDefinitionId,
            service.configuration,
          );
          return true;
        }
      }
    }
    return false;
  }
}
