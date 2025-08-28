import { Injectable } from '@nestjs/common';
import { ActionDefinition } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import {
  EnchainementDefinition,
  EnchainementID,
} from '../domain/kyc/enchainementDefinition';
import { EnchainementKYC } from '../domain/kyc/enchainementKYC';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import {
  CLE_PERSO,
  Personnalisator,
} from '../infrastructure/personnalisation/personnalisator';
import { ActionRepository } from '../infrastructure/repository/action.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';

@Injectable()
export class QuestionKYCEnchainementUsecase {
  constructor(
    private utilisateurRepository: UtilisateurRepository,
    private actionRepository: ActionRepository,
    private personnalisator: Personnalisator,
    private actionUsecase: ActionUsecase,
  ) {}

  async getEnchainementQuestions(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<QuestionKYC[]> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    if (!EnchainementID[enchainementId]) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    const liste_kycs_codes = EnchainementDefinition.getKycCodesByEnchainementID(
      EnchainementID[enchainementId],
    );

    const result =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(liste_kycs_codes);

    return this.personnalisator.personnaliser(result, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }
  async getFirst(
    utilisateurId: string,
    enchainementId: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setFirst();

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getNext(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setNext(current_kyc_code);

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  async getPrevious(
    utilisateurId: string,
    enchainementId: string,
    current_kyc_code: string,
  ): Promise<EnchainementKYC> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    Utilisateur.checkState(utilisateur);

    const liste_kyc = this.listeKycFromEnchainementId(
      enchainementId,
      utilisateur,
    );

    const enchainement = new EnchainementKYC(
      liste_kyc,
      utilisateur.kyc_history,
    );

    enchainement.setPrevious(current_kyc_code);

    return this.personnalisator.personnaliser(enchainement, utilisateur, [
      CLE_PERSO.espace_insecable,
      CLE_PERSO.block_text_cms,
      CLE_PERSO.no_blank_links,
    ]);
  }

  private listeKycFromEnchainementId(
    enchainementId: string,
    utilisateur: Utilisateur,
  ): QuestionKYC[] {
    const actionCodeType =
      ActionDefinition.getTypeCodeFromString(enchainementId);
    const is_enchainement_simulateur =
      this.actionRepository.isSimulateur(actionCodeType);
    const is_enchainement_bilan = this.actionRepository.isBilan(actionCodeType);

    if (
      !EnchainementID[enchainementId] &&
      !is_enchainement_simulateur &&
      !is_enchainement_bilan
    ) {
      ApplicationError.throwUnkownEnchainement(enchainementId);
    }

    if (is_enchainement_simulateur) {
      const kyc_codes = this.actionUsecase.external_get_kyc_codes_from_action(
        TypeAction.simulateur,
        actionCodeType.code,
      );

      return utilisateur.kyc_history.getListeKycsFromCodes(kyc_codes);
    }

    if (is_enchainement_bilan) {
      const kyc_codes = this.actionUsecase.external_get_kyc_codes_from_action(
        TypeAction.bilan,
        actionCodeType.code,
      );

      return utilisateur.kyc_history.getListeKycsFromCodes(kyc_codes);
    }

    return utilisateur.kyc_history.getListeKycsFromCodes(
      EnchainementDefinition.getKycCodesByEnchainementID(
        EnchainementID[enchainementId],
      ),
    );
  }
}
