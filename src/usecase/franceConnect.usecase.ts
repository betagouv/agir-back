import { Injectable } from '@nestjs/common';
import { App } from '../domain/app';
import { PasswordManager } from '../domain/utilisateur/manager/passwordManager';
import {
  GlobalUserVersion,
  Scope,
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { FCUserInfo, OidcService } from '../infrastructure/auth/oidc.service';
import { OIDCStateRepository } from '../infrastructure/repository/oidcState.repository';
import { TokenRepository } from '../infrastructure/repository/token.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneUsecase } from './bilanCarbone.usecase';

@Injectable()
export class FranceConnectUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private oidcService: OidcService,
    private passwordManager: PasswordManager,
    private oIDCStateRepository: OIDCStateRepository,
    private tokenRepository: TokenRepository,
    private bilanCarboneUseCase: BilanCarboneUsecase,
  ) {}

  async genererConnexionFranceConnect(
    source_inscription: SourceInscription,
    situation_ngc_id?: string,
  ): Promise<URL> {
    if (App.isFranceConnectDown()) {
      ApplicationError.throwConnexionDown(App.getEmailContact());
    }

    const redirect_infos = this.oidcService.generatedAuthRedirectUrl();

    if (situation_ngc_id && situation_ngc_id.length !== 36) {
      ApplicationError.throwBadSituationID(situation_ngc_id);
    }

    await this.oIDCStateRepository.createNewState(
      redirect_infos.state,
      redirect_infos.nonce,
      source_inscription,
      situation_ngc_id,
    );

    return redirect_infos.url;
  }

  async connecterOuInscrire(
    oidc_state: string,
    oidc_code: string,
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
      const message = `FranceConnect : state manquant en base de donnée : ${oidc_state}`;
      console.error(message);
      ApplicationError.throwSecurityTechnicalProblemDetected(message);
    }

    console.log(state);

    // Récupération ACCESS_TOKEN
    const tokens = await this.oidcService.getAccessAndIdTokens(oidc_code);

    console.log(`access token : [${tokens.access_token}]`);
    console.log(`id token : [${tokens.id_token}]`);

    // Vérification NONCE
    const id_token_data = this.oidcService.decodeIdToken(tokens.id_token);
    if (id_token_data.nonce !== state.nonce) {
      const message = `FranceConnect : mismatch sur NONCE => sent[${state.nonce}] VS received[${id_token_data.nonce}]`;
      console.error(message);
      ApplicationError.throwSecurityTechnicalProblemDetected(message);
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
      this.setFCUserInfoToUser(fc_user, user_info);
      await this.utilisateurRepository.updateUtilisateurNoConcurency(fc_user, [
        Scope.core,
      ]);

      return await this.log_ok_fc_user(oidc_state, fc_user);
    }

    // RAPPROCHEMENT avec email + année de naissance d'un utilisateur J'agis
    const standard_user = await this.utilisateurRepository.findByEmail(
      user_info.email,
      'full',
    );

    if (standard_user) {
      if (
        standard_user.getDateNaissanceString() !== user_info.birthdate &&
        standard_user.global_user_version !== GlobalUserVersion.V1
      ) {
        ApplicationError.throwErreurRapporchementCompte();
      }
      await this.utilisateurRepository.setFranceConnectSub(
        standard_user.id,
        user_info.sub,
      );
      this.setFCUserInfoToUser(standard_user, user_info);

      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        standard_user,
        [Scope.core],
      );
      return await this.log_ok_fc_user(oidc_state, standard_user);
    }

    // NEW UTILISATEUR CREATION
    const new_utilisateur = Utilisateur.createNewUtilisateur(
      user_info.email,
      false,
      SourceInscription[state.source_inscription] || SourceInscription.inconnue,
    );

    this.setFCUserInfoToUser(new_utilisateur, user_info);
    new_utilisateur.status = UtilisateurStatus.default;
    new_utilisateur.active_account = true;
    new_utilisateur.est_valide_pour_classement = true;

    if (state.situation_ngc_id) {
      await this.bilanCarboneUseCase.external_inject_situation_to_user_kycs(
        new_utilisateur,
        state.situation_ngc_id,
      );
    }

    await this.utilisateurRepository.createUtilisateur(new_utilisateur);

    return await this.log_ok_fc_user(oidc_state, new_utilisateur);
  }

  private setFCUserInfoToUser(utilisateur: Utilisateur, user_info: FCUserInfo) {
    utilisateur.prenom = user_info.given_name;
    utilisateur.nom = user_info.family_name;
    utilisateur.annee_naissance = this.getAnnee(user_info.birthdate);
    utilisateur.mois_naissance = this.getMois(user_info.birthdate);
    utilisateur.jour_naissance = this.getJour(user_info.birthdate);
    utilisateur.france_connect_sub = user_info.sub;
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

    await this.passwordManager.initLoginStateAfterSuccess(utilisateur);

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
  async external_logout_france_connect_by_state(
    state: string,
  ): Promise<{ fc_logout_url?: URL }> {
    const stateDB = await this.oIDCStateRepository.getByState(state);

    if (!stateDB) {
      // RIEN A FAIRE
      return {};
    }
    const logout_url = this.oidcService.generateLogoutUrl(stateDB.idtoken);

    // REMOVE STATE
    await this.oIDCStateRepository.deleteByState(state);

    return { fc_logout_url: logout_url };
  }

  async logout_FC_only(state: string): Promise<{ fc_logout_url?: URL }> {
    const result = await this.external_logout_france_connect_by_state(state);
    return { fc_logout_url: result.fc_logout_url };
  }

  private getAnnee(date: string): number {
    if (!date) return null;
    const parsed = parseInt(date.substring(0, 4));
    return Number.isNaN(parsed) ? null : parsed;
  }
  private getMois(date: string): number {
    if (!date) return null;
    const parsed = parseInt(date.substring(5, 7));
    return Number.isNaN(parsed) ? null : parsed;
  }
  private getJour(date: string): number {
    if (!date) return null;
    const parsed = parseInt(date.substring(8));
    return Number.isNaN(parsed) ? null : parsed;
  }
}
