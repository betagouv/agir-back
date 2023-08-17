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
import { AuthGuard } from '../auth/guard';
import { UtilisateurRepository } from '../repository/utilisateur.repository';
import { OidcService } from '../auth/oidc.service';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AuthController {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
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
    const redirect_url =
      await this.oidcService.generatedAuthRedirectUrlAndSaveState();
    return { url: redirect_url };
  }

  @Get('login-callback')
  @Redirect()
  @ApiExcludeEndpoint()
  async login_callback(
    @Query('code') oidc_code: string,
    @Query('loginid') loginId: string,
  ) {
    // TOKEN ENDPOINT
    const access_token = await this.oidcService.getAccessToken(
      loginId,
      oidc_code,
    );

    // INFO ENDPOINT
    const user_data = await this.oidcService.getUserDataByAccessToken(
      access_token,
    );

    // FINDING USER
    let utilisateur = await this.utilisateurRepository.findUtilisateurByEmail(
      user_data.email,
    );
    if (!utilisateur) {
      utilisateur = await this.utilisateurRepository.createUtilisateur({
        name: user_data.family_name || 'John Doe '.concat(uuidv4()),
        email: user_data.email,
      });
    }
    const utilisateurId = utilisateur.id;

    await this.oidcService.injectUtilisateurIdToState(loginId, utilisateurId);

    // CREATING INNER APP TOKEN
    const token = await this.oidcService.createNewInnerAppToken(utilisateurId);
    return {
      url: process.env.FRONT_BASE_URL.concat(
        process.env.FINAL_LOGIN_REDIRECT,
        `?utilisateurId=${utilisateurId}&token=${token}`,
      ),
    };
  }

  @Get('welcome')
  @ApiExcludeEndpoint()
  async welcome(
    @Query('token') token: string,
    @Query('utilisateurId') utilisateurId: string,
  ) {
    let utilisateur = await this.utilisateurRepository.findUtilisateurById(
      utilisateurId,
    );
    return `<br>Bonjour ${utilisateur.name}
    <br>utilisateurId = ${utilisateurId}
    <br>token = ${token}
    <br><a href='/logout/${utilisateurId}'>Se dé-connecter de France Connect</a>`;
  }

  @Get('profile/:id')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard)
  async profile(@Req() req: Request, @Param('id') utilisateurId: string) {
    const tokenUtilisateurId =
      AuthGuard.getUtilisateurIdFromTokenInRequest(req);
    if (utilisateurId !== tokenUtilisateurId) {
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
    const redirect_url =
      await this.oidcService.generatedLogoutUrlAndDeleteState(utilisateurId);
    return { url: redirect_url };
  }

  @Get('logout-callback')
  @ApiExcludeEndpoint()
  async logout_callback() {
    return `<br>Vous êtes bien déconnecté !!
    <br><a href='/login'>Se connecter avec France Connect</a>`;
  }
}
