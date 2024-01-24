import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WinterListeSubAPI } from '../../api/types/winter/WinterListeSubAPI';
import { ServiceDynamicData } from '../../../domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import { ServiceRepository } from '../../../../src/infrastructure/repository/service.repository';
import { AsyncServiceManager } from '../AsyncServiceManager';
import { Service, ServiceStatus } from '../../../../src/domain/service/service';
import { UtilisateurRepository } from '../../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DepartementRepository } from '../../../../src/infrastructure/repository/departement/departement.repository';
import { LinkyData } from '../../../../src/domain/linky/linkyData';
import { LinkyRepository } from '../../../../src/infrastructure/repository/linky.repository';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';

const PRM_CONF_KEY = 'prm';
const LIVE_PRM_CONF_KEY = 'live_prm';
const WINTER_PK_KEY = 'winter_pk';

@Injectable()
export class LinkyServiceManager
  implements LiveServiceManager, AsyncServiceManager
{
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly utilisateurRepository: UtilisateurRepository,
    private readonly departementRepository: DepartementRepository,
    private readonly linkyRepository: LinkyRepository,
  ) {}
  async computeLiveDynamicData(): Promise<ServiceDynamicData> {
    return {
      label: '🔌 Votre Linky',
      isInError: false,
    };
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
    try {
      switch (service.status) {
        case ServiceStatus.LIVE:
          return `ALREADY LIVE : ${service.serviceDefinitionId} - ${service.serviceId}`;
        case ServiceStatus.CREATED:
          return await this.activateService(service);
        case ServiceStatus.TO_DELETE:
          return await this.removeService(service);
        default:
          return `UNKNOWN STATUS : ${service.serviceDefinitionId} - ${service.serviceId} - ${service.status}`;
      }
    } catch (error) {
      return `ERROR ${
        service.status === ServiceStatus.CREATED ? 'CREATING' : 'DELETING'
      }: ${service.serviceDefinitionId} - ${service.serviceId} : ${
        error.code
      }/${error.message}`;
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
    } catch (error) {
      service.addErrorCodeToConfiguration(error.code);
      service.addErrorMessageToConfiguration(error.message);
      throw error;
    }

    service.configuration[WINTER_PK_KEY] = winter_pk;
    service.configuration[LIVE_PRM_CONF_KEY] = prm;

    const new_linky_data = new LinkyData({
      prm: prm,
      serie: [],
    });

    await this.linkyRepository.upsertData(new_linky_data);
    await this.serviceRepository.updateServiceConfiguration(
      utilisateur.id,
      service.serviceDefinitionId,
      service.configuration,
      ServiceStatus.LIVE,
    );
    return `INITIALISED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  async list_souscriptions(page?: number): Promise<WinterListeSubAPI> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return {
        count: 1,
        next: '1',
        previous: '1',
        results: [
          { enedis_prm: '12345', department_number: '91', pk: '7614671637' },
        ],
      };
    }
    const final_page = page ? page : 1;
    let response;
    try {
      response = await axios.get(
        process.env.WINTER_URL.concat(`?page=${final_page}`),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.WINTER_API_KEY,
          },
        },
      );
    } catch (error) {
      console.log('Erreur à la lecture des souscriptions linky');
      console.log(error.message);
      console.log(error);
      throw error;
    }
    return response.data;
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
}
