import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OIDCStateRepository } from '../../../src/infrastructure/repository/oidcState.repository';
import { OIDCState } from '../../../src/infrastructure/auth/oidcState';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
const url = require('url');

const APP_SCOPES = 'openid email given_name';
const EIDAS_LEVEL = 'eidas1';
@Injectable()
export class OidcService {
  constructor(
    private jwtService: JwtService,
    private oIDCStateRepository: OIDCStateRepository,
  ) {}

  async generatedAuthRedirectUrlAndSaveState(): Promise<URL> {
    let OIDC_STATE: OIDCState = {
      state: uuidv4(),
    };
    let redirect_url = new URL(process.env.OIDC_URL_AUTH);
    let params = redirect_url.searchParams;
    params.append('response_type', 'code');
    params.append('client_id', process.env.OIDC_CLIENT_ID);
    params.append(
      'redirect_uri',
      process.env.BASE_URL_FRONT.concat(
        `${process.env.OIDC_URL_LOGIN_CALLBACK}`,
      ),
    );
    params.append('scope', APP_SCOPES);
    params.append('acr_values', EIDAS_LEVEL);
    params.append('state', OIDC_STATE.state);
    params.append('nonce', uuidv4());

    await this.oIDCStateRepository.createNewState(OIDC_STATE);

    console.log(redirect_url);
    return redirect_url;
  }

  async generatedLogoutUrlAndDeleteState(utilisateurId: string): Promise<URL> {
    const logout_url = await this.generateLogoutUrl(utilisateurId);
    if (logout_url) {
      await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
    }
    return logout_url;
  }

  async self_logout(utilisateurId: string): Promise<void> {
    let logout_url = await this.generateLogoutUrl(utilisateurId);
    if (!logout_url) {
      // RIEN A FAIRE
      return;
    }

    let response;
    try {
      response = await axios.get(logout_url.toString());
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return;
    }
    console.log(response);

    // REMOVE STATE
    await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
  }

  private async generateLogoutUrl(utilisateurId: string): Promise<URL> {
    let OIDC_STATE = await this.oIDCStateRepository.getByUtilisateurId(
      utilisateurId,
    );
    if (!OIDC_STATE) {
      return null;
    }
    let logout_url = new URL(process.env.OIDC_URL_LOGOUT);
    let params = logout_url.searchParams;
    params.append('id_token_hint', OIDC_STATE.idtoken);
    params.append('state', uuidv4());
    params.append(
      'post_logout_redirect_uri',
      process.env.BASE_URL.concat(process.env.OIDC_URL_LOGOUT_CALLBACK),
    );

    // REMOVE STATE
    return logout_url;
  }

  async getAccessToken(
    state: string,
    oidc_code: string,
  ): Promise<string | null> {
    let response;
    try {
      const params = new url.URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: process.env.BASE_URL_FRONT.concat(
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
    await this.oIDCStateRepository.updateState({
      state: state,
      idtoken: response.data.id_token,
    });

    return response.data.access_token;
  }
  async getUserDataByAccessToken(access_token: string): Promise<any | null> {
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
    return response.data;
  }

  async injectUtilisateurIdToState(state: string, utilisateurId: string) {
    await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
    await this.oIDCStateRepository.updateState({
      state,
      utilisateurId,
    });
  }

  async createNewInnerAppToken(utilisateurId: string): Promise<string> {
    return this.jwtService.signAsync({ utilisateurId });
  }
}
