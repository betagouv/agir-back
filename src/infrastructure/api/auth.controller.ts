import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';
import { OidcService } from '../auth/oidc.service';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { App } from '../../../src/domain/app';
import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../../domain/utilisateur/utilisateur';
import { KycRepository } from '../repository/kyc.repository';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';

@Controller()
@ApiExcludeController()
export class AuthController {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private profileUsecase: ProfileUsecase,
    private oidcService: OidcService,
  ) {}

  @Get('login_france_connect')
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
    console.log(user_data);

    // FINDING USER
    let utilisateur = await this.profileUsecase.findUtilisateurByEmail(
      user_data.email,
    );
    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        user_data.email,
        false,
        SourceInscription.france_connect,
      );

      utilisateur.prenom = user_data.given_name;
      utilisateur.nom = user_data.family_name;
      utilisateur.status = UtilisateurStatus.default;
      utilisateur.active_account = true;

      utilisateur.kyc_history.setCatalogue(KycRepository.getCatalogue());

      await this.utilisateurRepository.createUtilisateur(utilisateur);
    }

    await this.oidcService.injectUtilisateurIdToState(loginId, utilisateur.id);

    // CREATING INNER APP TOKEN
    const token = await this.oidcService.createNewInnerAppToken(utilisateur.id);
    return {
      url: App.getBaseURLFront().concat(
        process.env.FINAL_LOGIN_REDIRECT,
        `?utilisateurId=${utilisateur.id}&token=${token}`,
      ),
    };
  }

  @Get('welcome')
  @ApiExcludeEndpoint()
  async welcome(
    @Query('token') token: string,
    @Query('utilisateurId') utilisateurId: string,
  ) {
    let utilisateur = await this.profileUsecase.findUtilisateurById(
      utilisateurId,
    );
    return `<br>Bonjour ${utilisateur.nom}
    <br>utilisateurId = ${utilisateurId}
    <br>token = ${token}
    <br><a href='/logout/${utilisateurId}'>Se dé-connecter de France Connect</a>`;
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
