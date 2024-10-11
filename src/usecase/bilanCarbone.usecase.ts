import { Injectable } from '@nestjs/common';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneStatistiqueRepository } from '../infrastructure/repository/bilanCarboneStatistique.repository';
import { Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  NiveauImpact,
} from '../domain/bilan/bilanCarbone';
import { TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { QuestionKYCUsecase } from './questionKYC.usecase';
import { Univers } from '../domain/univers/univers';

@Injectable()
export class BilanCarboneUsecase {
  constructor(
    private nGCCalculator: NGCCalculator,
    private utilisateurRepository: UtilisateurRepository,
    private bilanCarboneStatistiqueRepository: BilanCarboneStatistiqueRepository,
    private kycRepository: KycRepository,
  ) {}

  async getCurrentBilanByUtilisateurId(utilisateurId: string): Promise<{
    bilan_complet: BilanCarbone;
    bilan_synthese: BilanCarboneSynthese;
  }> {
    const utilisateur = await this.utilisateurRepository.getById(utilisateurId);
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const situation = this.computeSituation(utilisateur);

    const bilan_complet =
      this.nGCCalculator.computeBilanCarboneFromSituation(situation);

    const liste_kycs_transport =
      QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_bilan_transport'];

    const enchainement_transport =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        liste_kycs_transport,
      );
    const enchainement_transport_progression =
      enchainement_transport.getProgression();

    return {
      bilan_complet: bilan_complet,
      bilan_synthese: {
        impact_alimentation: NiveauImpact.tres_fort,
        impact_logement: NiveauImpact.fort,
        impact_transport: NiveauImpact.moyen,
        impact_consommation: NiveauImpact.faible,
        pourcentage_completion_totale: 35,
        liens_bilans_univers: [
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728466903/Mobilite_df75aefd09.svg',
            univers: Univers.transport,
            nombre_total_question: enchainement_transport_progression.target,
            pourcentage_progression: Math.round(
              (enchainement_transport_progression.current /
                enchainement_transport_progression.target) *
                100,
            ),
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
            temps_minutes: 5,
          },
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728466523/cuisine_da54797693.svg',
            univers: Univers.alimentation,
            nombre_total_question: 9,
            pourcentage_progression: 30,
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
            temps_minutes: 3,
          },
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728468852/conso_7522b1950d.svg',
            univers: Univers.consommation,
            nombre_total_question: 12,
            pourcentage_progression: 70,
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
            temps_minutes: 10,
          },
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728468978/maison_80242d91f3.svg',
            univers: Univers.logement,
            nombre_total_question: 12,
            pourcentage_progression: 70,
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
            temps_minutes: 9,
          },
        ],
      },
    };
  }

  async computeBilanTousUtilisateurs(): Promise<string[]> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id);

      const situation = this.computeSituation(utilisateur);

      const bilan = this.nGCCalculator.computeBilanFromSituation(situation);

      await this.bilanCarboneStatistiqueRepository.upsertStatistiques(
        user_id,
        situation,
        bilan.bilan_carbone_annuel * 1000,
        bilan.details.transport * 1000,
        bilan.details.alimentation * 1000,
      );
    }
    return user_id_liste;
  }

  public computeSituation(utilisateur: Utilisateur): Object {
    const situation = {};

    for (const kyc of utilisateur.kyc_history.answered_questions) {
      if (kyc.is_NGC) {
        if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
          if (kyc.ngc_key && kyc.reponses && kyc.reponses.length > 0) {
            situation[kyc.ngc_key] = kyc.reponses[0].ngc_code;
          } else {
            console.error(`Missing ngc key for KYC [${kyc.id_cms}/${kyc.id}]`);
          }
        }
        if (
          kyc.type === TypeReponseQuestionKYC.entier ||
          kyc.type === TypeReponseQuestionKYC.decimal
        ) {
          if (kyc.ngc_key && kyc.reponses && kyc.reponses.length > 0) {
            situation[kyc.ngc_key] = kyc.reponses[0].label;
          } else {
            console.error(`Missing ngc key for KYC [${kyc.id_cms}/${kyc.id}]`);
          }
        }
      }
    }
    return situation;
  }
}
