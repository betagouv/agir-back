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
    const prm = configuration['prm'];
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
      return `ERROR : ${service.serviceDefinitionId} - ${service.serviceId} : ${error.message}`;
    }
  }
  private async removeService(service: Service): Promise<string> {
    const winter_pk = service.configuration['winter_pk'];
    const prm = service.configuration['prm'];

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      service.utilisateurId,
    );
    await this.deleteSouscription(winter_pk);

    await this.linkyRepository.deleteLinky(prm);

    await this.serviceRepository.removeServiceFromUtilisateurByServiceDefinitionId(
      utilisateur.id,
      service.serviceDefinitionId,
    );

    return `DELETED : ${service.serviceDefinitionId} - ${service.serviceId} - prm:${prm}`;
  }

  private async activateService(service: Service): Promise<string> {
    const prm = service.configuration['prm'];

    if (!prm) {
      return `ERROR : ${service.serviceDefinitionId} - ${service.serviceId} : missing prm data`;
    }

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      service.utilisateurId,
    );

    const code_departement =
      this.departementRepository.findDepartementByCodePostal(
        utilisateur.code_postal,
      );

    const winter_pk = await this.souscription_API(prm, code_departement);

    service.configuration['winter_pk'] = winter_pk;
    const new_linky_data = new LinkyData({
      prm: prm,
      serie: [],
    });

    await this.linkyRepository.createNewLinky(new_linky_data);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
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
      return '7614671637';
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
      console.log('Erreur à la souscription linky');
      console.log(error);
      console.log(response);
      throw error;
    }
    return response.data.pk;
  }
  async deleteSouscription(pk_winter: string): Promise<void> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return;
    }

    let response;
    try {
      response = await axios.delete(
        process.env.WINTER_URL.concat(pk_winter, '/'),
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.WINTER_API_KEY,
          },
        },
      );
    } catch (error) {
      console.log('Erreur à la suppression souscription linky');
      console.log(error);
      console.log(response);
      throw error;
    }
  }
}
