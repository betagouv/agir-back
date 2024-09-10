import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { App } from '../../../../src/domain/app';
import { ApplicationError } from '../../applicationError';

@Injectable()
export class LinkyAPIConnector {
  constructor() {}

  async souscription_API(
    prm: string,
    code_departement: string,
  ): Promise<string> {
    // FIXME : TEMP FOR TESTS
    if (prm === '12345678901111') {
      return 'ok_winter_pk_1';
    }
    if (prm === '12345678903333') {
      return 'ok_winter_pk_3';
    }
    if (prm === '12345678904444') {
      return 'ok_winter_pk_4';
    }
    // FIXME : TEMP FOR TESTS
    if (prm === '12345678902222') {
      ApplicationError.throwUnknownPRM('12345678902222');
    }
    if (prm === '12345678905555') {
      ApplicationError.throwUnknownEnedisError(
        '12345678902222',
        'code_123',
        'blurp',
      );
    }

    if (!App.isWinterAPIEnabled()) {
      return 'fake_winter_pk';
    }
    let response;
    const data = `{
      "enedis_prm": "${prm}",
      "department_number": "${code_departement}"
    }`;
    try {
      response = await axios.post(App.getWinterApiURL(), data, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': App.getWinterAPIKey(),
        },
      });
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          console.log(error.response.data);
          if (error.response.status === 404) {
            ApplicationError.throwUnknownLinky404();
          }
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
          if (
            error.response.data.error &&
            error.response.data.error.message &&
            error.response.data.error.message.includes('SGT483')
          ) {
            // PRM inconnu, saisie utilisateur sans doute avec une coquille
            ApplicationError.throwUnknownPRM_2(prm);
          }
          /* Sous silence pour le moment, car des fois.... ça marche
          if (
            error.response.data.error &&
            error.response.data.error.code === 'prm_already_subscribed'
          ) {
            // PRM déjà souscrit auprès de winter
            ApplicationError.throwAlreadySubscribedError(prm);
          }
          */
          if (error.response.data.error) {
            // Erreur Enedis
            ApplicationError.throwUnknownEnedisError(
              prm,
              error.response.data.error.code,
              error.response.data.error.message,
            );
          }
          ApplicationError.throwUnknownLinkyError(
            prm,
            JSON.stringify(error.response),
          );
        } else {
          ApplicationError.throwUnknownLinkyError(
            prm,
            JSON.stringify(error.response),
          );
        }
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
    if (winter_pk === 'ok_winter_pk_3') {
      return;
    }
    if (winter_pk === 'ok_winter_pk_1') {
      ApplicationError.throwAlreadyDeletedLinkyError(winter_pk);
    }
    if (winter_pk === 'ok_winter_pk_4') {
      ApplicationError.throwUnknownLinkyErrorWhenDelete(winter_pk, 'blurp');
    }
    if (!App.isWinterAPIEnabled()) {
      return;
    }

    try {
      await axios.delete(App.getWinterApiURL().concat(winter_pk, '/'), {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': App.getWinterAPIKey(),
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
