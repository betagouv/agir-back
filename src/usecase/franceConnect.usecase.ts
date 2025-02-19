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

    // FINDING FRANCE CONNECT USER BY SUB
    const fc_user = await this.utilisateurRepository.getByFranceConnectSub(
      user_info.sub,
      'full',
    );
    if (fc_user) {
      return await this.log_ok_fc_user(oidc_state, fc_user);
    }

    // FINDING FRANCE CONNECT USER BY EMAIL
    const standard_user = await this.utilisateurRepository.findByEmail(
      user_info.email,
      'full',
    );
    if (standard_user) {
      await this.utilisateurRepository.setFranceConnectSub(
        standard_user.id,
        user_info.sub,
      );
      return await this.log_ok_fc_user(oidc_state, standard_user);
    }

    // NEW UTILISATEUR CREATION
    const new_utilisateur = Utilisateur.createNewUtilisateur(
      user_info.email,
      false,
      SourceInscription.france_connect,
    );

    new_utilisateur.prenom = user_info.given_name;
    new_utilisateur.status = UtilisateurStatus.default;
    new_utilisateur.active_account = true;
    new_utilisateur.est_valide_pour_classement = true;
    new_utilisateur.france_connect_sub = user_info.sub;

    await this.utilisateurRepository.createUtilisateur(new_utilisateur);

    return await this.log_ok_fc_user(oidc_state, new_utilisateur);
  }

  private async log_ok_fc_user(
    state: string,
    utilisateur: Utilisateur,
  ): Promise<{
    token: string;
    utilisateur: Utilisateur;
  }> {
    await this.oIDCStateRepository.setUniqueUtilisateurId(
      state,
      utilisateur.id,
    );

    this.passwordManager.initLoginState(utilisateur);

    const token = await this.tokenRepository.createNewAppToken(utilisateur.id);

    return { token: token, utilisateur: utilisateur };
  }

  async logout_france_connect(
    utilisateurId: string,
  ): Promise<{ fc_logout_url?: URL }> {
    const state = await this.oIDCStateRepository.getByUtilisateurId(
      utilisateurId,
    );

    if (!state) {
      // RIEN A FAIRE
      return {};
    }
    const logout_url = this.oidcService.generateLogoutUrl(state.idtoken);

    // REMOVE STATE
    await this.oIDCStateRepository.delete(utilisateurId);

    return { fc_logout_url: logout_url };
  }
}
