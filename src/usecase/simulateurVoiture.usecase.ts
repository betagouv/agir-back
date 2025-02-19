import { Injectable } from '@nestjs/common';
import { KYCID } from 'src/domain/kyc/KYCID';
import {
  VoitureActuelle,
  VoitureAlternatives,
  VoitureCible,
} from 'src/domain/simulateur_voiture/resultats';
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

function getParams(utilisateur: Utilisateur): SimulateurVoitureParams {
  const questions = utilisateur.kyc_history.getRawAnsweredKYCs();
  const params = new SimulateurVoitureParams();

  for (const question of questions) {
    switch (question.code) {
      case KYCID.KYC_transport_voiture_gabarit: {
        params.set(
          'voiture . gabarit',
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_gabarit>()
            ?.ngc_code,
        );
      }

      case KYCID.KYC_transport_voiture_km: {
        params.set('usage . km annuels . connus', 'oui');
        params.set(
          'usage . km annuels . renseignés',
          question.getReponseSimpleValueAsNumber(),
        );
        break;
      }

      case KYCID.KYC_transport_voiture_motorisation: {
        params.set(
          'voiture . motorisation',
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_motorisation>()
            ?.ngc_code,
        );
        break;
      }

      case KYCID.KYC_transport_voiture_thermique_carburant: {
        params.set(
          'voiture . thermique . carburant',
          question.getSelectedAnswer<KYCID.KYC_transport_voiture_thermique_carburant>()
            ?.ngc_code,
        );
        break;
      }
    }
  }

  return params;
}
