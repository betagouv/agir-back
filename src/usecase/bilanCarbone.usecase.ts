import { Injectable } from '@nestjs/common';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanCarboneStatistiqueRepository } from '../infrastructure/repository/bilanCarboneStatistique.repository';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  NiveauImpact,
} from '../domain/bilan/bilanCarbone';
import { TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { QuestionKYCUsecase } from './questionKYC.usecase';
import { Univers } from '../domain/univers/univers';
import { KYCID } from '../domain/kyc/KYCID';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';

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
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement],
    );
    utilisateur.checkState();

    const kyc_catalogue = await this.kycRepository.getAllDefs();
    utilisateur.kyc_history.setCatalogue(kyc_catalogue);

    const situation = this.computeSituation(utilisateur);

    const bilan_complet =
      this.nGCCalculator.computeBilanCarboneFromSituation(situation);

    const enchainement_mini_bilan =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_mini_bilan_carbone'],
      );
    const enchainement_transport =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_bilan_transport'],
      );
    const enchainement_logement =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_bilan_logement'],
      );
    const enchainement_conso =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_bilan_consommation'],
      );
    const enchainement_alimentation =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCUsecase.ENCHAINEMENTS['ENCHAINEMENT_KYC_bilan_alimentation'],
      );

    const enchainement_minibilan_progression =
      enchainement_mini_bilan.getProgression();
    const enchainement_transport_progression =
      enchainement_transport.getProgression();
    const enchainement_logement_progression =
      enchainement_logement.getProgression();
    const enchainement_conso_progression = enchainement_conso.getProgression();
    const enchainement_alimentation_progression =
      enchainement_alimentation.getProgression();

    const pourcentage_prog_totale = Math.round(
      ((enchainement_minibilan_progression.current +
        enchainement_transport_progression.current +
        enchainement_logement_progression.current +
        enchainement_conso_progression.current +
        enchainement_alimentation_progression.current) /
        (enchainement_transport_progression.target +
          enchainement_logement_progression.target +
          enchainement_conso_progression.target +
          enchainement_alimentation_progression.target +
          enchainement_minibilan_progression.target)) *
        100,
    );

    return {
      bilan_complet: bilan_complet,
      bilan_synthese: {
        impact_alimentation: this.computeImpactAlimentation(utilisateur),
        impact_logement: this.computeImpactLogement(utilisateur),
        impact_transport: this.computeImpactTransport(utilisateur),
        impact_consommation: this.computeImpactConsommation(utilisateur),
        pourcentage_completion_totale: pourcentage_prog_totale,
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
            nombre_total_question: enchainement_alimentation_progression.target,
            pourcentage_progression: Math.round(
              (enchainement_alimentation_progression.current /
                enchainement_alimentation_progression.target) *
                100,
            ),
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_alimentation',
            temps_minutes: 3,
          },
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728468852/conso_7522b1950d.svg',
            univers: Univers.consommation,
            nombre_total_question: enchainement_conso_progression.target,
            pourcentage_progression: Math.round(
              (enchainement_conso_progression.current /
                enchainement_conso_progression.target) *
                100,
            ),
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_consommation',
            temps_minutes: 10,
          },
          {
            image_url:
              'https://res.cloudinary.com/dq023imd8/image/upload/v1728468978/maison_80242d91f3.svg',
            univers: Univers.logement,
            nombre_total_question: enchainement_logement_progression.target,
            pourcentage_progression: Math.round(
              (enchainement_logement_progression.current /
                enchainement_logement_progression.target) *
                100,
            ),
            id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_logement',
            temps_minutes: 9,
          },
        ],
      },
    };
  }

  async computeBilanTousUtilisateurs(): Promise<string[]> {
    const user_id_liste = await this.utilisateurRepository.listUtilisateurIds();

    const kyc_catalogue = await this.kycRepository.getAllDefs();

    for (const user_id of user_id_liste) {
      const utilisateur = await this.utilisateurRepository.getById(user_id, [
        Scope.kyc,
      ]);
      utilisateur.kyc_history.setCatalogue(kyc_catalogue);

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

    const kyc_liste = utilisateur.kyc_history.getAllUpToDateQuestionSet(true);
    console.log(kyc_liste);
    for (const entry of kyc_liste) {
      const kyc = entry.kyc;
      console.log(kyc);

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

  private computeImpactTransport(utilisateur: Utilisateur): NiveauImpact {
    const kyc_voiture = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_transport_voiture_km,
    );
    if (!kyc_voiture) return null;
    if (!kyc_voiture.hasAnyResponses()) return null;

    const kyc_avion = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_transport_avion_3_annees,
    );
    if (!kyc_avion) return null;
    if (!kyc_avion.hasAnyResponses()) return null;

    const avion = kyc_avion.includesReponseCode('oui');
    const km = parseInt(kyc_voiture.reponses[0].label);
    if (!avion) {
      if (km < 1000) return NiveauImpact.faible;
      if (km < 10000) return NiveauImpact.moyen;
      if (km < 15000) return NiveauImpact.fort;
      return NiveauImpact.tres_fort;
    } else {
      if (km < 10000) return NiveauImpact.fort;
      return NiveauImpact.tres_fort;
    }
  }
  private computeImpactAlimentation(utilisateur: Utilisateur): NiveauImpact {
    const kyc_regime = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_alimentation_regime,
    );
    if (!kyc_regime) return null;
    if (!kyc_regime.hasAnyResponses()) return null;

    const regime_code = kyc_regime.getCodeReponseUniqueSaisie();
    switch (regime_code) {
      case 'vegetalien':
        return NiveauImpact.faible;
      case 'vegetarien':
        return NiveauImpact.moyen;
      case 'peu_viande':
        return NiveauImpact.fort;
      case 'chaque_jour_viande':
        return NiveauImpact.tres_fort;
    }
    return null;
  }
  private computeImpactConsommation(utilisateur: Utilisateur): NiveauImpact {
    const kyc_type_conso =
      utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC_consommation_type_consommateur,
      );
    if (!kyc_type_conso) return null;
    if (!kyc_type_conso.hasAnyResponses()) return null;

    const code = kyc_type_conso.getCodeReponseUniqueSaisie();
    switch (code) {
      case 'achete_jamais':
        return NiveauImpact.faible;
      case 'seconde_main':
        return NiveauImpact.moyen;
      case 'raisonnable':
        return NiveauImpact.fort;
      case 'shopping_addict':
        return NiveauImpact.tres_fort;
    }
    return null;
  }
  private computeImpactLogement(utilisateur: Utilisateur): NiveauImpact {
    const kyc_menage = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_menage,
    );
    if (!kyc_menage) return null;
    if (!kyc_menage.hasAnyResponses()) return null;

    const kyc_superficie =
      utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
        KYCID.KYC_superficie,
      );
    if (!kyc_superficie) return null;
    if (!kyc_superficie.hasAnyResponses()) return null;

    if (
      !utilisateur.kyc_history.isMosaicAnswered(KYCMosaicID.MOSAIC_CHAUFFAGE)
    ) {
      return null;
    }

    const kyc_bois = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_chauffage_bois,
    );
    if (!kyc_bois) return null;
    if (!kyc_bois.hasAnyResponses()) return null;

    const kyc_elec = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_chauffage_elec,
    );
    if (!kyc_elec) return null;
    if (!kyc_elec.hasAnyResponses()) return null;

    const kyc_gaz = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_chauffage_gaz,
    );
    if (!kyc_gaz) return null;
    if (!kyc_gaz.hasAnyResponses()) return null;

    const kyc_fioul = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_chauffage_fioul,
    );
    if (!kyc_fioul) return null;
    if (!kyc_fioul.hasAnyResponses()) return null;

    const is_fioul = kyc_fioul.getCodeReponseUniqueSaisie() === 'oui';
    const is_gaz = kyc_gaz.getCodeReponseUniqueSaisie() === 'oui';
    const is_elec = kyc_elec.getCodeReponseUniqueSaisie() === 'oui';
    const is_bois = kyc_bois.getCodeReponseUniqueSaisie() === 'oui';

    let type_chauffage_nbr;

    if (is_fioul) {
      type_chauffage_nbr = 4;
    } else if (is_gaz) {
      type_chauffage_nbr = 3;
    } else if (is_elec || is_bois) {
      type_chauffage_nbr = 1;
    } else {
      type_chauffage_nbr = 2;
    }

    const nbr_hab = parseInt(kyc_menage.reponses[0].label);
    const superficie = parseInt(kyc_superficie.reponses[0].label);
    let nbr_superficie;
    if (superficie <= 35) nbr_superficie = 1;
    if (superficie <= 70) nbr_superficie = 2;
    if (superficie <= 100) nbr_superficie = 3;
    if (superficie <= 150) nbr_superficie = 4;
    if (superficie > 150) nbr_superficie = 5;

    const nbr_adultes = Math.min(nbr_hab, 2);
    const nbr_enfants = nbr_hab <= 2 ? 0 : nbr_hab - 2;
    const nbr_hab_pondere = nbr_adultes + 0.33 * nbr_enfants;
    const logement_moyen = 1.5;

    const impact_number =
      (logement_moyen * nbr_superficie * type_chauffage_nbr) / nbr_hab_pondere;

    if (impact_number <= 2) return NiveauImpact.faible;
    if (impact_number <= 4) return NiveauImpact.moyen;
    if (impact_number <= 8) return NiveauImpact.fort;
    return NiveauImpact.tres_fort;
  }
}
