import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { WinterListeSubAPI } from '../../api/types/winter/WinterListeSubAPI';
import { ServiceDynamicData } from '../../../domain/service/serviceDefinition';
import { LiveServiceManager } from '../LiveServiceManager';

@Injectable()
export class LinkyServiceManager implements LiveServiceManager {
  constructor() {}
  async computeLiveDynamicData(): Promise<ServiceDynamicData> {
    return {
      label: 'Votre Linky 🔌',
      isInError: false,
    };
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
      throw error;
    }
    return response.data;
  }
  async souscription(prm: string, code_departement: string): Promise<string> {
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
      throw error;
    }
    return response.data.pk;
  }
}
