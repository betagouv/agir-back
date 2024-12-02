import { Injectable } from '@nestjs/common';
import { KYCID } from 'src/domain/kyc/KYCID';
import { SimulateurVoitureResultat } from 'src/domain/simulateur_voiture/resultats';
import { Scope, Utilisateur } from 'src/domain/utilisateur/utilisateur';
import {
  SimulateurVoitureParams,
  SimulateurVoitureRepository,
} from 'src/infrastructure/repository/simulateurVoiture.repository';
import { UtilisateurRepository } from 'src/infrastructure/repository/utilisateur/utilisateur.repository';

@Injectable()
export class SimulateurVoitureUsecase {
  constructor(
    private simulateurVoitureRepository: SimulateurVoitureRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  async calculerResultat(userId: string): Promise<SimulateurVoitureResultat> {
    const utilisateur = await this.utilisateurRepository.getById(userId, [
      Scope.kyc,
    ]);
    const params = getKYCValues(utilisateur);

    return this.simulateurVoitureRepository.getResultat(params);
  }
}

function getKYCValues(utilisateur: Utilisateur): SimulateurVoitureParams {
  const questions = utilisateur.kyc_history.answered_questions;
  const res: SimulateurVoitureParams = {};

  for (const question of questions) {
    switch (question.code) {
      case KYCID.KYC_transport_voiture_motorisation: {
        const selectedAnswered =
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_motorisation>();
        // NOTE: there is no typecheck error if the rule name is incorrect
        res['voiture . motorisation'] = selectedAnswered?.ngc_code;
        break;
      }

      case KYCID.KYC_transport_voiture_km: {
        const answer = question.getReponseSimpleValueAsNumber();
        res['usage . km annuels . connus'] = 'oui';
        res['usage . km annuels . renseignés'] = answer;
        break;
      }
    }
  }

  return res;
}
