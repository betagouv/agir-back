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
import { LinkyRepository } from '../../../../src/infrastructure/repository/linky.repository';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { LinkyAPIConnector } from './LinkyAPIConnector';
import { LinkyEmailer } from './LinkyEmailer';
import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';
import { LinkyConsent } from '../../../../src/domain/linky/linkyConsent';
import { LinkyConsentRepository } from '../../../../src/infrastructure/repository/linkyConsent.repository';
import { CommuneRepository } from '../../../../src/infrastructure/repository/commune/commune.repository';

const DUREE_CONSENT_ANNEES = 3;

export enum LINKY_CONF_KEY {
  sent_data_email = 'sent_data_email',
  prm = 'prm',
  live_prm = 'live_prm',
  winter_pk = 'winter_pk',
  departement = 'departement',
  date_consent = 'date_consent',
  date_fin_consent = 'date_fin_consent',
}

@Injectable()
export class LinkyServiceManager
  implements LiveServiceManager, AsyncServiceManager
{
  constructor(
    private readonly linkyConsentRepository: LinkyConsentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly communeRepository: CommuneRepository,
    private readonly linkyEmailer: LinkyEmailer,
    private readonly linkyRepository: LinkyRepository,
    private readonly linkyAPIConnector: LinkyAPIConnector,
  ) {}
  async computeLiveDynamicData(service: Service): Promise<ServiceDynamicData> {
    const prm = service.configuration[LINKY_CONF_KEY.prm];
    if (this.isBadPRM(service)) {
      return {
        label: '⚠️ PRM incorrect, mettez le à jour !',
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
        label: '🔌 Vos données sont en chemin !',
        isInError: false,
      };
    }
    const linky_data = await this.linkyRepository.getByPRM(prm);

    if (!linky_data || linky_data.serie.length === 0) {
      return {
        label: '🔌 Vos données sont en chemin !',
        isInError: false,
      };
    }

    const last_variation = linky_data.getLastVariation();
    let couleur = last_variation.pourcent <= 0 ? `🟢` : '🔴';
    let plus = last_variation.pourcent > 0 ? '+' : '';
    return {
      label: `${couleur} ${last_variation.day} ${plus}${last_variation.pourcent}%`,
      isInError: false,
    };
  }

  private isBadPRM(service: Service) {
    return (
      service.configuration[ServiceErrorKey.error_code] === '032' ||
      service.configuration[ServiceErrorKey.error_code] === '039'
    );
  }

  async isConfigured(service: Service) {
    return !!service.configuration[LINKY_CONF_KEY.prm];
  }
  async isActivated(service: Service) {
    return !!service.configuration[LINKY_CONF_KEY.live_prm];
  }
  async isFullyRunning(service: Service) {
    const empty = await this.linkyRepository.isPRMDataEmptyOrMissing(
      service.configuration[LINKY_CONF_KEY.prm],
    );
    return !empty;
  }

  async processAndUpdateConfiguration(service: Service): Promise<void> {
    Service.resetErrorState(service.configuration);

    const utilisateur = await this.utilisateurRepository.getById(
      service.utilisateurId,
    );
    const consent = this.createConsent(
      utilisateur,
      service.configuration[LINKY_CONF_KEY.prm],
    );

    service.configuration[LINKY_CONF_KEY.date_consent] =
      consent.date_consentement;

    service.configuration[LINKY_CONF_KEY.date_fin_consent] =
      consent.date_fin_consentement;

    await this.linkyConsentRepository.insert(consent);

    await this.serviceRepository.updateServiceConfiguration(
      service.utilisateurId,
      service.serviceDefinitionId,
      service.configuration,
    );

    const result = await this.runAsyncProcessing(service, true);

    if (result.includes('error_code:032')) {
      ApplicationError.throwUnknownPRM(
        service.configuration[LINKY_CONF_KEY.prm],
      );
    }
    if (result.includes('error_code:039')) {
      ApplicationError.throwUnknownPRM_2(
        service.configuration[LINKY_CONF_KEY.prm],
      );
    }
  }

  checkConfiguration(configuration: Object) {
    const prm = configuration[LINKY_CONF_KEY.prm];
    if (!prm) {
      ApplicationError.throwMissingPRM();
    }
    const regex = new RegExp('^[0-9]{14}$');
    if (!regex.test(prm)) {
      ApplicationError.throwBadPRM(prm);
    }
  }

  async runAsyncProcessing(
    service: Service,
    disable_error_email?: boolean,
  ): Promise<string> {
    const utilisateur = await this.utilisateurRepository.getById(
      service.utilisateurId,
    );

    const email_sent = await this.sendDataEmailIfNeeded(service, utilisateur);

    try {
      switch (service.status) {
        case ServiceStatus.LIVE:
          return `ALREADY LIVE : ${service.serviceDefinitionId} - ${service.serviceId} | data_email:${email_sent}`;
        case ServiceStatus.CREATED:
          return (await this.activateService(service, utilisateur)).concat(
            ` | data_email:${email_sent}`,
          );
        case ServiceStatus.TO_DELETE:
          return (await this.removeService(service, utilisateur)).concat(
            ` | data_email:${email_sent}`,
          );
        default:
          return `UNKNOWN STATUS : ${service.serviceDefinitionId} - ${service.serviceId} - ${service.status} | data_email:${email_sent}`;
      }
    } catch (error) {
      console.log(error);
      if (error.code === '032' && !disable_error_email) {
        await this.linkyEmailer.sendConfigurationKOEmail(utilisateur);
      }
      return `ERROR ${
        service.status === ServiceStatus.CREATED ? 'CREATING' : 'DELETING'
      }: ${service.serviceDefinitionId} - ${service.serviceId} : error_code:${
        error.code
      }/${error.message} | data_email:${email_sent}`;
    }
  }

  async removeService(
    service: Service,
    utilisateur: Utilisateur,
  ): Promise<string> {
    const winter_pk = service.configuration[LINKY_CONF_KEY.winter_pk];
    const prm = service.configuration[LINKY_CONF_KEY.prm];
    const error_code = service.configuration[ServiceErrorKey.error_code];

    if (error_code === '037') {
      await this.linkyRepository.delete(prm);
      await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
        utilisateur.id,
        service.serviceDefinitionId,
      );
      await this.deletePRM(prm, utilisateur.id, service.serviceDefinitionId);
      return `ALREADY DELETED : ${service.serviceDefinitionId} - ${service.serviceId} prm = ${prm} winter_pk=${winter_pk}`;
    } else {
      try {
        await this.linkyAPIConnector.deleteSouscription(winter_pk);
        service.resetErrorState();
      } catch (error) {
        if (error.code === '037') {
          await this.deletePRM(
            prm,
            utilisateur.id,
            service.serviceDefinitionId,
          );
          return `ALREADY DELETED : ${service.serviceDefinitionId} - ${service.serviceId} prm = ${prm} winter_pk=${winter_pk}`;
        } else {
          service.addErrorCodeToConfiguration(error.code);
          service.addErrorMessageToConfiguration(error.message);
          await this.serviceRepository.updateServiceConfiguration(
            utilisateur.id,
            service.serviceDefinitionId,
            service.configuration,
          );
          throw error;
        }
      }
      await this.deletePRM(prm, utilisateur.id, service.serviceDefinitionId);

      return `DELETED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
    }
  }

  private async deletePRM(
    prm: string,
    utilisateurId: string,
    serviceDefinitionId: string,
  ): Promise<void> {
    await this.linkyRepository.delete(prm);

    await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      utilisateurId,
      serviceDefinitionId,
    );
  }

  async activateService(
    service: Service,
    utilisateur: Utilisateur,
  ): Promise<string> {
    const prm = service.configuration[LINKY_CONF_KEY.prm];
    const error_code = service.configuration[ServiceErrorKey.error_code];

    if (!prm) {
      return `ERROR : ${service.serviceDefinitionId} - ${service.serviceId} : missing prm data`;
    }
    if (error_code === '032') {
      return `SKIP : ${service.serviceDefinitionId} - ${service.serviceId} prm = ${prm} : unkonwn prm`;
    }

    if (service.configuration[LINKY_CONF_KEY.live_prm]) {
      if (
        service.configuration[LINKY_CONF_KEY.live_prm] ===
        service.configuration[LINKY_CONF_KEY.prm]
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

    const localisation_commune =
      this.communeRepository.findDepartementRegionByCodePostal(
        utilisateur.logement.code_postal,
      );

    let winter_pk;
    try {
      winter_pk = await this.linkyAPIConnector.souscription_API(
        prm,
        localisation_commune.code_departement,
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

    service.configuration[LINKY_CONF_KEY.winter_pk] = winter_pk;
    service.configuration[LINKY_CONF_KEY.live_prm] = prm;
    service.configuration[LINKY_CONF_KEY.departement] =
      localisation_commune.code_departement;

    await this.serviceRepository.updateServiceConfiguration(
      utilisateur.id,
      service.serviceDefinitionId,
      service.configuration,
      ServiceStatus.LIVE,
    );

    await this.linkyRepository.upsertLinkyEntry(prm, winter_pk, utilisateur.id);

    return `INITIALISED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  private createConsent(utilisateur: Utilisateur, prm: string): LinkyConsent {
    const current_year = new Date().getFullYear();
    const end_date = new Date();
    end_date.setFullYear(current_year + DUREE_CONSENT_ANNEES);

    return {
      utilisateurId: utilisateur.id,
      date_consentement: new Date(),
      date_fin_consentement: end_date,
      type_donnees: 'index quotidien, index corrigé météo',
      mention_usage_donnees:
        'Proposer aux utilisateurs un suivi quotidien de leur consommation électrique ainsi que des comparaisons de consommation sur des périodes de 2 ans et plus',
      texte_signature: `Je déclare sur l'honneur être titulaire du point ou être mandaté par celui-ci et j'accepte que le service 'Agir' ait accès à mes données des 2 ans passés et pour les 3 ans à venir. Je peux changer d'avis à tout moment sur mon compte Enedis.`,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      prm: prm,
    };
  }

  private async sendDataEmailIfNeeded(
    service: Service,
    utilisateur: Utilisateur,
  ): Promise<boolean> {
    const sentDataEmail = service.configuration[LINKY_CONF_KEY.sent_data_email];
    if (!sentDataEmail) {
      const live_prm = service.configuration[LINKY_CONF_KEY.live_prm];
      if (live_prm) {
        const empty = await this.linkyRepository.isPRMDataEmptyOrMissing(
          live_prm,
        );
        if (!empty) {
          await this.linkyEmailer.sendAvailableDataEmail(utilisateur);
          service.configuration[LINKY_CONF_KEY.sent_data_email] = true;
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
