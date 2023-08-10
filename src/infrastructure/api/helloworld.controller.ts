import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guard';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur.repository';
import { OIDCStateRepository } from '../../../src/infrastructure/repository/oidcState.repository';
import { OIDCState } from '../../../src/infrastructure/auth/oidcState';

@Controller()
export class HelloworldController {
  constructor(
    private jwtService: JwtService,
    private utilisateurRepository: UtilisateurRepository,
    private oIDCStateRepository: OIDCStateRepository,
  ) {}

  @Get()
  @ApiExcludeEndpoint()
  async getHello() {
    return "<br><a href='/login'>Se connecter avec France Connect</a>";
  }

  @Get('login')
  @Redirect()
  @ApiExcludeEndpoint()
  async login() {
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

    return { url: redirect_url };
  }

  @Get('login-callback')
  @Redirect()
  @ApiExcludeEndpoint()
  async login_callback(
    @Req() req: Request,
    @Query('code') oidc_code: string,
    @Query('loginid') loginId: string,
  ) {

    // TOKEN ENDPOINT
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
    }

    // INFO ENDPOINT
    let response2;
    try {
      response2 = await axios.get(process.env.OIDC_URL_INFO, {
        headers: {
          Authorization: `Bearer ${response.data.access_token}`,
        },
      });
    } catch (error) {
      console.log(error.message);
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
    // FINDING USER
    let utilisateur = await this.utilisateurRepository.findUtilisateurByEmail(
      response2.data.email,
    );
    let utilisateurId = utilisateur.id;

    let OIDC_STATE: OIDCState = {
      loginId,
      idtoken: response.data.id_token,
      utilisateurId,
    };
    await this.oIDCStateRepository.deleteByUtilisateurId(utilisateurId);
    await this.oIDCStateRepository.updateState(OIDC_STATE);

    // CREATING INNER APP TOKEN
    const payload = { utilisateurId };
    let token = await this.jwtService.signAsync(payload);
    return {
      url: process.env.BASE_URL.concat(
        `/welcome?utilisateurId=${utilisateurId}&token=${token}`,
      ),
    };
  }

  @Get('welcome')
  @ApiExcludeEndpoint()
  async welcome(
    @Query('token') token: string,
    @Query('utilisateurId') utilisateurId: string,
  ) {
    return `<br>Bonjour ${utilisateurId} (token : ${token})<br>
    <a href='/logout/${utilisateurId}'>Se dé-connecter de France Connect</a>`;
  }

  @Get('profile/:id')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard)
  async profile(@Req() req: Request, @Param('id') utilisateurId: string) {
    if (utilisateurId !== req['tokenUtilisateurId']) {
      throw new ForbiddenException(
        `Vous n'avez pas le droit de consulter les données de l'utilisateur ${utilisateurId} `,
      );
    }
    return this.utilisateurRepository.findUtilisateurById(utilisateurId);
  }

  @Get('logout/:id')
  @Redirect()
  @ApiExcludeEndpoint()
  async logout(@Param('id') utilisateurId: string) {
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
    return { url: redirect_url };
  }

  @Get('logout-callback')
  @ApiExcludeEndpoint()
  async logout_callback() {
    return `<br>Vous êtes bien déconnecté !!
    <br><a href='/login'>Se connecter avec France Connect</a>`;
  }
}
