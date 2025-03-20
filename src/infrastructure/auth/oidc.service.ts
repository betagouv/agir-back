import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { App } from '../../domain/app';
const url = require('url');

const APP_SCOPES = 'openid email given_name family_name birthdate';
const EIDAS_LEVEL = 'eidas1';

export type FCUserInfo = {
  sub: string; // '93b1b2bf30db78a4c74df9c36afde68806411fda1c8952ed1051ce410040952ev1'
  email: string; //'wossewodda-3728@yopmail.com'
  given_name: string; //'Angela Claire Louise'
  given_name_array: string[];
  aud: string; // '55f7fd3e83931809dc07a8928a613a7f89d4a63df60b9d059e61ad8312e55541'
  exp: number; //1740645729
  iat: number; //1740645669
  iss: string; //'https://fcp-low.integ01.dev-franceconnect.fr/api/v2'
};

export type ID_TOKEN_FORMAT = {
  sub: string; //'93b1b2bf30db78a4c74df9c36afde68806411fda1c8952ed1051ce410040952ev1';
  auth_time: number; //1740645668;
  acr: string; //'eidas1';
  nonce: string; //'ac5e2e1a-e0e1-4824-8087-28b862226d64';
  at_hash: string; //'DSd0aMdDE3KLzu8DuTxaTA';
  aud: string; //'55f7fd3e83931809dc07a8928a613a7f89d4a63df60b9d059e61ad8312e55541';
  exp: number; //1740645729;
  iat: number; //1740645669;
  iss: string; //'https://fcp-low.integ01.dev-franceconnect.fr/api/v2';
};

export type InitialisationURL = {
  url: URL;
  state: string;
  nonce: string;
};

@Injectable()
export class OidcService {
  generatedAuthRedirectUrl(): InitialisationURL {
    const state = uuidv4();
    const nonce = uuidv4();

    let redirect_url = new URL(process.env.OIDC_URL_AUTH);
    let params = redirect_url.searchParams;
    params.append('response_type', 'code');
    params.append('client_id', process.env.OIDC_CLIENT_ID);
    params.append(
      'redirect_uri',
      App.getBaseURLFront().concat(`${process.env.OIDC_URL_LOGIN_CALLBACK}`),
    );
    params.append('scope', APP_SCOPES);
    params.append('acr_values', EIDAS_LEVEL);
    params.append('state', state);
    params.append('nonce', nonce);

    console.log(redirect_url);

    return { url: redirect_url, state: state, nonce: nonce };
  }

  public generateLogoutUrl(id_token: string): URL {
    let logout_url = new URL(process.env.OIDC_URL_LOGOUT);

    let params = logout_url.searchParams;

    params.append('id_token_hint', id_token);
    params.append('state', uuidv4());
    params.append(
      'post_logout_redirect_uri',
      App.getBaseURLFront().concat(process.env.OIDC_URL_LOGOUT_CALLBACK),
    );

    return logout_url;
  }

  async getAccessAndIdTokens(
    oidc_code: string,
  ): Promise<{ access_token: string; id_token: string } | null> {
    let response;
    try {
      const params = new url.URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: App.getBaseURLFront().concat(
          `${process.env.OIDC_URL_LOGIN_CALLBACK}`,
        ),
        code: oidc_code,
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
      });
      response = await axios.post(
        process.env.OIDC_URL_TOKEN,
        params.toString(),
      );
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return null;
    }
    console.log(response.data);

    return {
      access_token: response.data.access_token,
      id_token: response.data.id_token,
    };
  }
  async getUserInfoByAccessToken(
    access_token: string,
  ): Promise<FCUserInfo | null> {
    let response;
    try {
      response = await axios.get(process.env.OIDC_URL_INFO, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return null;
    }

    const user_data_base64: string = response.data;

    console.log('THIS IS USER DATA BASE64');
    console.log(user_data_base64);

    const blocks = user_data_base64.split('.');
    const charge_utile = blocks[1];
    const json_user_data = Buffer.from(charge_utile, 'base64').toString(
      'ascii',
    );
    console.log(json_user_data);
    const user_info: FCUserInfo = JSON.parse(json_user_data);

    return user_info;
  }

  public decodeIdToken(id_token: string): ID_TOKEN_FORMAT {
    const blocks = id_token.split('.');
    const charge_utile = blocks[1];
    const json_data = Buffer.from(charge_utile, 'base64').toString('ascii');
    return JSON.parse(json_data) as ID_TOKEN_FORMAT;
  }
}
