import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../domain/app';
import { ApplicationError } from '../../applicationError';

const SEARCH_PRM_URL =
  'https://api.winter-energies.fr/api/partner/1.0/prm/search';

const INSCRIRE_PRM_URL = 'https://api.winter-energies.fr/api/partner/1.0/user';

const SUPPRIMER_PRM_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID';

const LISTER_ACTIONS_URL =
  'https://api.winter-energies.fr/api/partner/1.0/user/USER_ID/action';

const API_TIMEOUT = 2000;

export type WinterFoundPRM = {
  prm: string;
  address: string;
  zipcode: string;
  city: string;
  name: string;
};

export type WinterAction = {
  slug: string; //"depoussierer-grille-refrigerateur",
  eligibility: string; //"eligible",
  economy: number; // 10,
  status: string; //"not_started",
  type: string; //"ecogeste",
  usage: string; //"appliances"
};

export type WinterActionList = {
  actionStateProxyResponse: WinterAction[];
  computingFinished: boolean;
};

@Injectable()
export class WinterAPIClient {
  constructor() {}

  public async searchPRM(
    nom: string,
    rue: string,
    code_postal: string,
    nom_commune: string,
  ): Promise<WinterFoundPRM[]> {
    let response;
    const call_time = Date.now();
    const params = {
      lastname: nom,
      zipcode: code_postal,
      city: nom_commune,
      address: rue,
    };
    try {
      response = await axios.get(SEARCH_PRM_URL, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${App.getWinterAPIKey()}`,
        },
        params: params,
      });
    } catch (error) {
      console.log(
        `Error calling [winter_search_prm ${nom}-${code_postal}-${nom_commune}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      return [];
    }
    console.log(`API_TIME:winter_search_prm/${name}:${Date.now() - call_time}`);

    return response.data as WinterFoundPRM[];
  }

  public async inscrirePRM(
    prm: string,
    nom: string,
    ext_id: string,
    ip: string,
    user_agent: string,
    version_consentement: string,
  ): Promise<void> {
    let response;
    const call_time = Date.now();
    const payload = {
      prm: prm,
      name: nom,
      externalId: ext_id,
      ip: ip,
      userAgent: user_agent,
      version: version_consentement,
    };
    try {
      response = await axios.put(INSCRIRE_PRM_URL, payload, {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_put_prm ${JSON.stringify(payload)}] after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorInscriptionPRM();
    }
    console.log(`API_TIME:winter_put_prm/${prm}:${Date.now() - call_time}`);
  }

  public async supprimerPRM(ext_id: string): Promise<void> {
    const call_time = Date.now();

    try {
      await axios.delete(SUPPRIMER_PRM_URL.replace('USER_ID', ext_id), {
        timeout: API_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${App.getWinterAPIKey()}`,
        },
      });
    } catch (error) {
      console.log(
        `Error calling [winter_delete_prm user:${ext_id}]  after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorSuppressionPRM();
    }
    console.log(
      `API_TIME:winter_delete_prm:user:${ext_id}:${Date.now() - call_time}`,
    );
  }
  public async listerActions(ext_id: string): Promise<WinterActionList> {
    const call_time = Date.now();
    let response;
    try {
      response = await axios.get(
        LISTER_ACTIONS_URL.replace('USER_ID', ext_id),
        {
          timeout: API_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${App.getWinterAPIKey()}`,
          },
        },
      );
    } catch (error) {
      console.log(
        `Error calling [winter_actions:${ext_id}]  after ${
          Date.now() - call_time
        } ms`,
      );
      console.log(error);
      ApplicationError.throwErrorListingWinterActions();
    }
    console.log(
      `API_TIME:winter_actions:user:${ext_id}:${Date.now() - call_time}`,
    );
    return response.data;
  }
}
