import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WinterListeSubAPI } from '../../api/types/winter/WinterListeSubAPI';
import {
  ServiceDefinition,
  ServiceDynamicData,
} from '../../../domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';
import { ScheduledServiceManager } from '../ScheduledServiceManager';

@Injectable()
export class LinkyServiceManager
  implements LiveServiceManager, ScheduledServiceManager
{
  constructor() {}
  async computeLiveDynamicData(): Promise<ServiceDynamicData> {
    return {
      label: '🔌 Votre Linky',
      isInError: false,
    };
  }
  async computeScheduledDynamicData(
    serviceDefinition: ServiceDefinition,
  ): Promise<ServiceDynamicData> {
    return { label: 'toImplement', isInError: false };
  }

  /*
  async souscription(prm: string, code_departement: string) {
    if (!prm) {
      ApplicationError.throwMissingPRM();
    }
    if (!code_departement) {
      ApplicationError.throwMissingCodeDepartement();
    }

    const existing_linky_data = await this.linkyRepository.getLinky(prm);

    if (existing_linky_data !== null) {
      ApplicationError.throwAlreadySubscribedError();
    }

    const utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );

    utilisateur.prm = prm;
    utilisateur.code_departement = code_departement;

    const pk = await this.linkyServiceManager.souscription(
      prm,
      code_departement,
    );
    const new_linky_data = new LinkyData({
      prm: prm,
      pk_winter: pk,
      serie: [],
    });
    await this.linkyRepository.createNewLinky(new_linky_data);
    await this.utilisateurRepository.updateUtilisateur(utilisateur);
  }
  */

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
      console.log(error.message);
      console.log(error);
      throw error;
    }
    return response.data.pk;
  }
  async deleteSouscription(pk_winter: string): Promise<void> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return;
    }
    try {
      await axios.delete(process.env.WINTER_URL.concat(pk_winter, '/'), {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.WINTER_API_KEY,
        },
      });
    } catch (error) {
      console.log('Erreur à la suppression souscription linky');
      console.log(error.message);
      console.log(error);
      throw error;
    }
  }
}
