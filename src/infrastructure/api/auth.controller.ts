import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { ApiExcludeController, ApiExcludeEndpoint } from '@nestjs/swagger';
import { OidcService } from '../auth/oidc.service';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import { InscriptionUsecase } from '../../../src/usecase/inscription.usecase';
import { App } from '../../../src/domain/app';

@Controller()
@ApiExcludeController()
export class AuthController {
  constructor(
    private inscriptionUsecase: InscriptionUsecase,
    private utilisateurUsecase: UtilisateurUsecase,
    private oidcService: OidcService,
  ) {}

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
    let utilisateur = await this.utilisateurUsecase.findUtilisateurByEmail(
      user_data.email,
    );
    if (!utilisateur) {
      // FIXME : revoir le moment venu, c'est plus en ligne avec la création de compte standalone
      await this.inscriptionUsecase.createUtilisateur({
        nom: user_data.family_name,
        prenom: 'UNDEFINED',
        email: user_data.email,
        annee_naissance: 1900,
        onboardingData: {} as any,
      });
    }
    const utilisateurId = utilisateur.id; // FIXME : broken for now

    await this.oidcService.injectUtilisateurIdToState(loginId, utilisateurId);

    // CREATING INNER APP TOKEN
    const token = await this.oidcService.createNewInnerAppToken(utilisateurId);
    return {
      url: App.getBaseURLFront().concat(
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
    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
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
