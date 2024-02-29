import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ApplicationError } from '../../applicationError';

@Injectable()
export class LinkyAPIConnector {
  constructor() {}

  async souscription_API(
    prm: string,
    code_departement: string,
  ): Promise<string> {
    if (process.env.WINTER_API_ENABLED !== 'true') {
      return 'fake_winter_pk';
    }

    // FIXME : TEMP FOR TESTS
    if (prm === '12345678901111') {
      return 'ok_winter_pk';
    }
    // FIXME : TEMP FOR TESTS
    if (prm === '12345678902222') {
      ApplicationError.throwUnknownPRM('12345678902222');
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
        if (
          error.response.data.enedis_prm &&
          error.response.data.enedis_prm[0] === 'Invalid Enedis PRM'
        ) {
          // erreur fonctionnelle pas sensée se produire (pre contrôle du PRM à la conf)
          ApplicationError.throwBadPRM(prm);
        }
        if (
          error.response.data.error &&
          error.response.data.error.message &&
          error.response.data.error.message.includes('SGT401')
        ) {
          // PRM inconnu, saisie utilisateur sans doute avec une coquille
          ApplicationError.throwUnknownPRM(prm);
        }
        if (error.response.data.error) {
          // Erreur Enedis
          ApplicationError.throwUnknownEnedisError(
            prm,
            response.data.error.code,
            response.data.error.message,
          );
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
        if (
          error.response.data &&
          error.response.data.detail === 'Pas trouvé.'
        ) {
          ApplicationError.throwAlreadyDeletedLinkyError(winter_pk);
        }
        ApplicationError.throwUnknownLinkyErrorWhenDelete(
          winter_pk,
          JSON.stringify(error.response.data),
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
