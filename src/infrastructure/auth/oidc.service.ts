import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { OIDCStateRepository } from '../../../src/infrastructure/repository/oidcState.repository';
import { OIDCState } from '../../../src/infrastructure/auth/oidcState';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OidcService {
  constructor(
    private jwtService: JwtService,
    private oIDCStateRepository: OIDCStateRepository,
  ) {}

  async generatedAuthRedirectUrlAndSaveState(): Promise<URL> {
    let OIDC_STATE: OIDCState = {
      loginId: uuidv4(),
      nonce: uuidv4(),
      state: uuidv4(),
    };
    let redirect_url = new URL(process.env.OIDC_URL_AUTH);
    let params = redirect_url.searchParams;
    params.append('response_type', 'code');
    params.append('client_id', process.env.OIDC_CLIENT_ID);
    params.append(
      'redirect_uri',
      process.env.BASE_URL.concat(
        `${process.env.OIDC_URL_LOGIN_CALLBACK}?loginid=${OIDC_STATE.loginId}`,
      ),
    );
    params.append('scope', 'email profile');
    params.append('state', OIDC_STATE.state);
    params.append('nonce', OIDC_STATE.nonce);

    await this.oIDCStateRepository.createNewState(OIDC_STATE);

    return redirect_url;
  }
  async generatedLogoutUrlAndDeleteState(utilisateurId: string): Promise<URL> {
    let OIDC_STATE = await this.oIDCStateRepository.getByUtilisateurId(
      utilisateurId,
    );
    let redirect_url = new URL(process.env.OIDC_URL_LOGOUT);
    let params = redirect_url.searchParams;
    params.append('id_token_hint', OIDC_STATE.idtoken);
    params.append('state', OIDC_STATE.state);
    params.append(
      'post_logout_redirect_uri',
      process.env.BASE_URL.concat(process.env.OIDC_URL_LOGOUT_CALLBACK),
    );

    // REMOVE STATE
    await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
    return redirect_url;
  }
  async getAccessToken(
    loginId: string,
    oidc_code: string,
  ): Promise<string | null> {
    let response;
    try {
      response = await axios.post(process.env.OIDC_URL_TOKEN, {
        grant_type: 'authorization_code',
        redirect_uri: process.env.BASE_URL.concat(
          `${process.env.OIDC_URL_LOGIN_CALLBACK}?loginid=${loginId}`,
        ),
        code: oidc_code,
        client_id: process.env.OIDC_CLIENT_ID,
        client_secret: process.env.OIDC_CLIENT_SECRET,
      });
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      return null;
    }
    await this.oIDCStateRepository.updateState({
      loginId,
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
    console.log(response.data);
    return response.data;
  }

  async injectUtilisateurIdToState(loginId: string, utilisateurId: string) {
    await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
    await this.oIDCStateRepository.updateState({
      loginId,
      utilisateurId,
    });
  }

  async createNewInnerAppToken(utilisateurId: string): Promise<string> {
    return this.jwtService.signAsync({ utilisateurId });
  }
}
