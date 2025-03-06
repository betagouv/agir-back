import { Injectable } from '@nestjs/common';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { OidcService } from '../infrastructure/auth/oidc.service';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { InscriptionUsecase } from './inscription.usecase';

@Injectable()
export class FranceConnectUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
    private passwordManager: PasswordManager,
    private oIDCStateRepository: OIDCStateRepository,
    private tokenRepository: TokenRepository,
    private inscriptionUsecase: InscriptionUsecase,
  ) {}

  async genererConnexionFranceConnect(): Promise<URL> {
    const redirect_infos = this.oidcService.generatedAuthRedirectUrl();

    await this.oIDCStateRepository.createNewState(
      redirect_infos.state,
      redirect_infos.nonce,
    );

    return redirect_infos.url;
  }

  async connecterOuInscrire(
    oidc_state: string,
    oidc_code: string,
    situation_ngc_id?: string,
  ): Promise<{
    token: string;
    utilisateur: Utilisateur;
  }> {
    if (!oidc_code) {
      ApplicationError.throwCodeFranceConnectManquant();
    }
    if (!oidc_state) {
      ApplicationError.throwStateFranceConnectManquant();
    }

    const state = await this.oIDCStateRepository.getByState(oidc_state);
    if (!state) {
      console.error(
        `FranceConnect : state manquant en base de donnée : ${oidc_state}`,
      );
      ApplicationError.throwSecurityTechnicalProblemDetected();
    }

    console.log(state);

    // Récupération ACCESS_TOKEN
    const tokens = await this.oidcService.getAccessAndIdTokens(oidc_code);

    console.log(`access token : [${tokens.access_token}]`);
    console.log(`id token : [${tokens.id_token}]`);

    // Vérification NONCE
    const id_token_data = this.oidcService.decodeIdToken(tokens.id_token);
    if (id_token_data.nonce !== state.nonce) {
      console.error(
        `FranceConnect : mismatch sur NONCE => sent[${state.nonce}] VS received[${id_token_data.nonce}]`,
      );
      ApplicationError.throwSecurityTechnicalProblemDetected();
    }

    await this.oIDCStateRepository.setIdToken(state.state, tokens.id_token);

    // INFOS UTILISATEUR
    const user_info = await this.oidcService.getUserInfoByAccessToken(
      tokens.access_token,
    );
    console.log(user_info);

    // RAPPROCHEMENT avec pivot technique France Connect - SUB
    const fc_user = await this.utilisateurRepository.getByFranceConnectSub(
      user_info.sub,
      'full',
    );
    if (fc_user) {
      return await this.log_ok_fc_user(oidc_state, fc_user);
    }

    // RAPPROCHEMENT avec email d'un utilisateur J'agis
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

    if (situation_ngc_id) {
      await this.inscriptionUsecase.external_inject_situation_to_user_kycs(
        new_utilisateur,
        situation_ngc_id,
      );
    }

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

  async external_logout_france_connect(
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
