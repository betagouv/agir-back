import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { App } from '../../domain/app';
const url = require('url');

const APP_SCOPES = 'openid email given_name';
const EIDAS_LEVEL = 'eidas1';

export type FCUserInfo = {
  sub: string;
  email: string;
  given_name: string;
  given_name_array: string[];
  aud: string;
  exp: number;
  iat: number;
  iss: string;
};

@Injectable()
export class OidcService {
  generatedAuthRedirectUrl(): { url: URL; state: string } {
    const state = uuidv4();

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
    params.append('nonce', uuidv4());

    console.log(redirect_url);

    return { url: redirect_url, state: state };
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
}
