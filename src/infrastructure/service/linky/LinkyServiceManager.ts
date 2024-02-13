import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceDynamicData } from '../../../domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import { ServiceRepository } from '../../../../src/infrastructure/repository/service.repository';
import { AsyncServiceManager } from '../AsyncServiceManager';
import { Service, ServiceStatus } from '../../../../src/domain/service/service';
import { UtilisateurRepository } from '../../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DepartementRepository } from '../../../../src/infrastructure/repository/departement/departement.repository';
import { LinkyRepository } from '../../../../src/infrastructure/repository/linky.repository';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { EmailSender } from '../../../../src/infrastructure/email/emailSender';

const SENT_DATA_EMAIL_CONF_KEY = 'sent_data_email';
const PRM_CONF_KEY = 'prm';
const LIVE_PRM_CONF_KEY = 'live_prm';
const WINTER_PK_KEY = 'winter_pk';
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
    private readonly emailSender: EmailSender,
    private readonly linkyRepository: LinkyRepository,
  ) {}
  async computeLiveDynamicData(service: Service): Promise<ServiceDynamicData> {
    const prm = service.configuration[PRM_CONF_KEY];
    if (!this.isConfigured(service)) {
      return {
        label: '🔌 configurez Linky',
        isInError: false,
      };
    }
    if (this.isConfigured(service) && !this.isActivated(service)) {
      return {
        label: `🔌 Linky en cours d'activation...`,
        isInError: false,
      };
    }
    if (this.isActivated(service) && !this.isFullyRunning(service)) {
      return {
        label: '🔌 Vos données sont en chemin !',
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

  isConfigured(service: Service) {
    return !!service.configuration[PRM_CONF_KEY];
  }
  isActivated(service: Service) {
    return !!service.configuration[LIVE_PRM_CONF_KEY];
  }
  isFullyRunning(service: Service) {
    return !!service.configuration[SENT_DATA_EMAIL_CONF_KEY];
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

  private async removeService(service: Service): Promise<string> {
    const winter_pk = service.configuration[WINTER_PK_KEY];
    const prm = service.configuration[PRM_CONF_KEY];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      service.utilisateurId,
    );

    try {
      await this.deleteSouscription(winter_pk);
      service.resetErrorState();
    } catch (error) {
      service.addErrorCodeToConfiguration(error.code);
      service.addErrorMessageToConfiguration(error.message);
      throw error;
    }

    await this.linkyRepository.deleteLinky(prm);

    await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      utilisateur.id,
      service.serviceDefinitionId,
    );

    return `DELETED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  private async activateService(service: Service): Promise<string> {
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
      winter_pk = await this.souscription_API(prm, code_departement);
      service.resetErrorState();
    } catch (error) {
      service.addErrorCodeToConfiguration(error.code);
      service.addErrorMessageToConfiguration(error.message);
      throw error;
    }

    service.configuration[WINTER_PK_KEY] = winter_pk;
    service.configuration[LIVE_PRM_CONF_KEY] = prm;

    await this.serviceRepository.updateServiceConfiguration(
      utilisateur.id,
      service.serviceDefinitionId,
      service.configuration,
      ServiceStatus.LIVE,
    );

    await this.sendConfigurationOKEmail(utilisateur);

    return `INITIALISED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  async souscription_API(
    prm: string,
    code_departement: string,
  ): Promise<string> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return 'fake_winter_pk';
    }
    let response;
    const data = `{
      "enedis_prm": "${prm}",
      "department_number": "${code_departement}"
    }`;
    try {
      response = await axios.post(process.env.WINTER_URL, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.WINTER_API_KEY,
        },
      });
    } catch (error) {
      if (error.response) {
        console.log(error.response);
        if (
          response.data.enedis_prm &&
          response.data.enedis_prm[0] === 'Invalid Enedis PRM'
        ) {
          // erreur fonctionnelle pas sensé se produire (pre contrôle du PRM à la conf)
          ApplicationError.throwBadPRM(prm);
        }
        if (
          response.data.error.message &&
          response.data.error.message.includes('SGT401')
        ) {
          // PRM inconnu, saisie utilisateur sans doute avec une coquille
          ApplicationError.throwUnknownPRM(prm);
        }
        ApplicationError.throwUnknownLinkyError(
          prm,
          JSON.stringify(error.response),
        );
      } else if (error.request) {
        // erreur technique
        ApplicationError.throwUnknownLinkyError(
          prm,
          JSON.stringify(error.request),
        );
      }
      ApplicationError.throwUnknownLinkyError(prm, JSON.stringify(error));
    }
    return response.data.pk;
  }
  async deleteSouscription(winter_pk: string): Promise<void> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return;
    }

    try {
      await axios.delete(process.env.WINTER_URL.concat(winter_pk, '/'), {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.WINTER_API_KEY,
        },
      });
    } catch (error) {
      if (error.response) {
        ApplicationError.throwUnknownLinkyErrorWhenDelete(
          winter_pk,
          JSON.stringify(error.response),
        );
      } else if (error.request) {
        ApplicationError.throwUnknownLinkyErrorWhenDelete(
          winter_pk,
          JSON.stringify(error.request),
        );
      }
      ApplicationError.throwUnknownLinkyError(winter_pk, JSON.stringify(error));
    }
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
          await this.sendAvailableDataEmail(utilisateur);
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

  private async sendConfigurationOKEmail(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Votre service linky est bien configuré !<br> 
Encore un peu de patience et vos données de consommation seront disponibles.<br>
Généralement dans les 24h qui viennent.<br><br>

À très vite !`,
      `Bravo, vous avez bien configuré le service Linky`,
    );
  }

  private async sendAvailableDataEmail(utilisateur: Utilisateur) {
    this.emailSender.sendEmail(
      utilisateur.email,
      utilisateur.prenom,
      `Bonjour ${utilisateur.prenom},<br>
Vous pouvez dès à présent :<br>
- voir votre consommation électrique quotidienne<br>
- consulter votre historique jusqu'à deux ans dès maintenant<br>
- comparer d'une année à l'autre l'évolution de votre consommation<br><br>

<a href="${process.env.BASE_URL_FRONT}/agir/service/linky">Votre tableau de bord personnel</a><br><br>

À très vite !`,
      `Votre suivi de consommation électrique est disponible !`,
    );
  }
}
