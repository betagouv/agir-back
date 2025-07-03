import { Injectable } from '@nestjs/common';
import { KYCID } from '../domain/kyc/KYCID';
import { QuestionNumerique } from '../domain/kyc/new_interfaces/QuestionNumerique';
import { KYCS_TO_RULE_NAME } from '../domain/kyc/publicodesMapping';
import { RegleSimulateurVoiture } from '../domain/simulateur_voiture/parametres';
import {
  VoitureActuelle,
  VoitureAlternatives,
  VoitureCible,
} from '../domain/simulateur_voiture/resultats';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  SimulateurVoitureParamsConstructor,
  SimulateurVoitureRepository,
} from '../infrastructure/repository/simulateurVoiture.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class SimulateurVoitureUsecase {
  constructor(
    private simulateurVoitureRepository: SimulateurVoitureRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async calculerVoitureActuelle(userId: string): Promise<VoitureActuelle> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
    ]);
    const params = getParams(utilisateur);

    return this.simulateurVoitureRepository.evaluateVoitureActuelle(params);
  }

  async calculerVoitureAlternatives(
    userId: string,
  ): Promise<VoitureAlternatives> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
    ]);
    const params = getParams(utilisateur);

    return this.simulateurVoitureRepository.evaluateAlternatives(params);
  }

  async calculerVoitureCible(userId: string): Promise<VoitureCible> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
    ]);
    const params = getParams(utilisateur);

    return this.simulateurVoitureRepository.evaluateVoitureCible(params);
  }
}

function getParams(
  utilisateur: Utilisateur,
): SimulateurVoitureParamsConstructor {
  const questions = utilisateur.kyc_history
    .getAnsweredKYCs()
    .filter((kyc) => utilisateur.kyc_history.isKYCEligible(kyc));
  const params = new SimulateurVoitureParamsConstructor();

  for (const question of questions) {
    const regle: RegleSimulateurVoiture =
      KYCS_TO_RULE_NAME[question.code]?.['simulateur-voiture'];

    if (!regle) {
      continue;
    }

    switch (question.code) {
      case KYCID.KYC_transport_voiture_gabarit: {
        params.set(
          regle,
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_gabarit>()
            ?.ngc_code,
        );
        break;
      }

      case KYCID.KYC_transport_voiture_km: {
        // NOTE: Dans le simulateur voiture, il y a la possibilité de rentrer
        // les valeur en km annuels ou en km par trajet. Par simplicité, on
        // suppose que l'utilisateur a rentré les valeurs en km annuels.
        params.set('usage . km annuels . connus', 'oui');
        params.set(regle, new QuestionNumerique(question).getValue());
        break;
      }

      case KYCID.KYC_transport_voiture_motorisation: {
        const selectedAnswer =
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_motorisation>()
            ?.ngc_code;
        params.set(
          regle,
          selectedAnswer === "'hybride rechargeable'" ||
            selectedAnswer === "'hybride non rechargeable'"
            ? "'hybride'"
            : selectedAnswer,
        );
        break;
      }

      case KYCID.KYC_transport_voiture_thermique_carburant: {
        params.set(
          regle,
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_thermique_carburant>()
            ?.ngc_code,
        );
        break;
      }

      case KYCID.KYC_transport_voiture_occasion: {
        params.set(
          regle,
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_occasion>()
            ?.ngc_code,
        );
        break;
      }

      default: {
        if (question.isSimpleQuestion()) {
          // NOTE: pourrait être plus type safe.
          // Une solution serait de rajouter un case pour chaque question dans le
          // switch précédent. Mais vu qu'il y a une vingtaines de questions, ça
          // risquerait d'être un peu lourd.
          params.set(regle, question.getReponseSimpleValue() as any);
        } else {
          // NOTE: should we throw an error here?
          console.error('Unhandled question:', question.code);
        }
      }
    }
  }

  return params;
}
