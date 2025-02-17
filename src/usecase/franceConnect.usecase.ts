import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { ApplicationError } from '../infrastructure/applicationError';
import { ProfileUsecase } from './profile.usecase';
import { TokenRepository } from '../infrastructure/repository/token.repository';

@Injectable()
export class FranceConnectUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
    private passwordManager: PasswordManager,
    private oIDCStateRepository: OIDCStateRepository,
    private profileUsecase: ProfileUsecase,
    private tokenRepository: TokenRepository,
  ) {}

  async genererConnexionFranceConnect(): Promise<URL> {
    const redirect_infos = this.oidcService.generatedAuthRedirectUrl();

    await this.oIDCStateRepository.createNewState(redirect_infos.state);

    return redirect_infos.url;
  }

  async connecterOuInscrire(
    oidc_state: string,
    oidc_code: string,
  ): Promise<{
    token: string;
    utilisateur: Utilisateur;
  }> {
    const state = await this.oIDCStateRepository.getByState(oidc_state);
    if (!state) {
      ApplicationError.throwBadOIDCCodeState();
    }

    console.log(state);

    // TOKEN ENDPOINT
    const tokens = await this.oidcService.getAccessAndIdTokens(oidc_code);

    console.log(`access token : [${tokens.access_token}]`);
    console.log(`id token : [${tokens.id_token}]`);

    await this.oIDCStateRepository.setIdToken(state.state, tokens.id_token);

    // INFO ENDPOINT
    const user_info = await this.oidcService.getUserInfoByAccessToken(
      tokens.access_token,
    );
    console.log(user_info);

    // FINDING USER
    let utilisateur = await this.profileUsecase.findUtilisateurByEmail(
      user_info.email,
    );
    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        user_info.email,
        false,
        SourceInscription.france_connect,
      );

      utilisateur.prenom = user_info.given_name;
      utilisateur.status = UtilisateurStatus.default;
      utilisateur.active_account = true;
      utilisateur.est_valide_pour_classement = true;

      await this.utilisateurRepository.createUtilisateur(utilisateur);
    }

    await this.oIDCStateRepository.setUniqueUtilisateurId(
      oidc_state,
      utilisateur.id,
    );

    this.passwordManager.initLoginState(utilisateur);

    // CREATING INNER APP TOKEN
    const token = await this.tokenRepository.createNewAppToken(utilisateur.id);

    return { token: token, utilisateur: utilisateur };
  }

  async logout_france_connect(utilisateurId: string): Promise<void> {
    const state = await this.oIDCStateRepository.getByUtilisateurId(
      utilisateurId,
    );

    if (!state) {
      // RIEN A FAIRE
      return;
    }

    await this.oidcService.logout(state.idtoken);

    // REMOVE STATE
    await this.oIDCStateRepository.delete(utilisateurId);
  }
}
