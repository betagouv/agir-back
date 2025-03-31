import { Injectable } from '@nestjs/common';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  ImpactThematiqueStandalone,
  NiveauImpact,
  SituationNGC,
} from '../domain/bilan/bilanCarbone';
import { Feature } from '../domain/gamification/feature';
import { KYCID } from '../domain/kyc/KYCID';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { QuestionKYC, TypeReponseQuestionKYC } from '../domain/kyc/questionKYC';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { BilanCarboneStatistiqueRepository } from '../infrastructure/repository/bilanCarboneStatistique.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { QuestionKYCUsecase } from './questionKYC.usecase';

const SEUIL_POURCENTAGE_BILAN_COMPLET = 99;

export type EnchainementRecap = {
  enchainement_mini_bilan: QuestionKYC[];
  enchainement_transport: QuestionKYC[];
  enchainement_logement: QuestionKYC[];
  enchainement_conso: QuestionKYC[];
  enchainement_alimentation: QuestionKYC[];

  enchainement_transport_progression: { current: number; target: number };
  enchainement_logement_progression: { current: number; target: number };
  enchainement_conso_progression: { current: number; target: number };
  enchainement_alimentation_progression: { current: number; target: number };
  enchainement_minibilan_progression: { current: number; target: number };

  pourcentage_prog_totale: number;
  pourcentage_prog_totale_sans_mini_bilan: number;
};

@Injectable()
export class BilanCarboneUsecase {
  constructor(
    private nGCCalculator: NGCCalculator,
    private utilisateurRepository: UtilisateurRepository,
    private bilanCarboneStatistiqueRepository: BilanCarboneStatistiqueRepository,
  ) {}

  async getCurrentBilanByUtilisateurId(utilisateurId: string): Promise<{
    bilan_complet: BilanCarbone;
    bilan_synthese: BilanCarboneSynthese;
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement, Scope.unlocked_features],
    );
    Utilisateur.checkState(utilisateur);

    return await this.computeBilanComplet(utilisateur);
  }

  async getCurrentBilanByUtilisateurIdAndThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<ImpactThematiqueStandalone> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement, Scope.unlocked_features],
    );
    Utilisateur.checkState(utilisateur);

    const situation = this.external_compute_situation(utilisateur);

    return this.nGCCalculator.computeBilanCarboneThematiqueFromSituation(
      situation,
      thematique,
    );
  }

  async getCurrentBilanValeurTotale(utilisateurId: string): Promise<number> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.cache_bilan_carbone],
    );
    Utilisateur.checkState(utilisateur);

    return await this.external_bilan_valeur_total(utilisateur);
  }

  async external_bilan_valeur_total(utilisateur: Utilisateur): Promise<number> {
    const up_to_date = await this.isBilanStatUpToDate(utilisateur);

    if (up_to_date) {
      return utilisateur.cache_bilan_carbone.total_kg;
    }

    const situation = this.external_compute_situation(utilisateur);

    const bilan = this.nGCCalculator.computeBasicBilanFromSituation(situation);

    const cache_bilan = utilisateur.cache_bilan_carbone;

    cache_bilan.total_kg = bilan.bilan_carbone_annuel;
    cache_bilan.logement_kg = bilan.details.logement;
    cache_bilan.transport_kg = bilan.details.transport;
    cache_bilan.consommation_kg = bilan.details.divers;
    cache_bilan.alimentation_kg = bilan.details.alimentation;
    cache_bilan.updated_at = new Date();

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.cache_bilan_carbone],
    );

    return bilan.bilan_carbone_annuel;
  }

  public external_build_enchainement_bilan_recap(
    utilisateur: Utilisateur,
  ): EnchainementRecap {
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

    const enchainement_transport_progression = QuestionKYC.getProgression(
      enchainement_transport,
    );
    const enchainement_logement_progression = QuestionKYC.getProgression(
      enchainement_logement,
    );
    const enchainement_conso_progression =
      QuestionKYC.getProgression(enchainement_conso);
    const enchainement_alimentation_progression = QuestionKYC.getProgression(
      enchainement_alimentation,
    );
    const enchainement_minibilan_progression = QuestionKYC.getProgression(
      enchainement_mini_bilan,
    );

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

    const pourcentage_prog_totale_sans_mini_bilan = Math.round(
      ((enchainement_transport_progression.current +
        enchainement_logement_progression.current +
        enchainement_conso_progression.current +
        enchainement_alimentation_progression.current) /
        (enchainement_transport_progression.target +
          enchainement_logement_progression.target +
          enchainement_conso_progression.target +
          enchainement_alimentation_progression.target)) *
        100,
    );

    return {
      enchainement_mini_bilan,
      enchainement_transport,
      enchainement_logement,
      enchainement_conso,
      enchainement_alimentation,
      enchainement_transport_progression,
      enchainement_logement_progression,
      enchainement_conso_progression,
      enchainement_alimentation_progression,
      enchainement_minibilan_progression,
      pourcentage_prog_totale,
      pourcentage_prog_totale_sans_mini_bilan,
    };
  }

  private async computeBilanComplet(utilisateur: Utilisateur): Promise<{
    bilan_complet: BilanCarbone;
    bilan_synthese: BilanCarboneSynthese;
  }> {
    const recap = this.external_build_enchainement_bilan_recap(utilisateur);

    const bilan_synthese: BilanCarboneSynthese = {
      mini_bilan_dispo: false,
      bilan_complet_dispo: false,
      impact_alimentation: this.computeImpactAlimentation(utilisateur),
      impact_logement: this.computeImpactLogement(utilisateur),
      impact_transport: this.computeImpactTransport(utilisateur),
      impact_consommation: this.computeImpactConsommation(utilisateur),
      pourcentage_completion_totale: recap.pourcentage_prog_totale,
      liens_bilans_thematiques: [
        {
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728466903/Mobilite_df75aefd09.svg',
          thematique: Thematique.transport,
          nombre_total_question:
            recap.enchainement_transport_progression.target,
          pourcentage_progression: Math.round(
            (recap.enchainement_transport_progression.current /
              recap.enchainement_transport_progression.target) *
              100,
          ),
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_transport',
          temps_minutes: 5,
        },
        {
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728466523/cuisine_da54797693.svg',
          thematique: Thematique.alimentation,
          nombre_total_question:
            recap.enchainement_alimentation_progression.target,
          pourcentage_progression: Math.round(
            (recap.enchainement_alimentation_progression.current /
              recap.enchainement_alimentation_progression.target) *
              100,
          ),
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_alimentation',
          temps_minutes: 3,
        },
        {
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728468852/conso_7522b1950d.svg',
          thematique: Thematique.consommation,
          nombre_total_question: recap.enchainement_conso_progression.target,
          pourcentage_progression: Math.round(
            (recap.enchainement_conso_progression.current /
              recap.enchainement_conso_progression.target) *
              100,
          ),
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_consommation',
          temps_minutes: 10,
        },
        {
          image_url:
            'https://res.cloudinary.com/dq023imd8/image/upload/v1728468978/maison_80242d91f3.svg',
          thematique: Thematique.logement,
          nombre_total_question: recap.enchainement_logement_progression.target,
          pourcentage_progression: Math.round(
            (recap.enchainement_logement_progression.current /
              recap.enchainement_logement_progression.target) *
              100,
          ),
          id_enchainement_kyc: 'ENCHAINEMENT_KYC_bilan_logement',
          temps_minutes: 9,
        },
      ],
    };

    bilan_synthese.mini_bilan_dispo =
      !!bilan_synthese.impact_alimentation &&
      !!bilan_synthese.impact_consommation &&
      !!bilan_synthese.impact_logement &&
      !!bilan_synthese.impact_transport &&
      !utilisateur.vientDeNGC();

    if (
      bilan_synthese.pourcentage_completion_totale >
      SEUIL_POURCENTAGE_BILAN_COMPLET
    ) {
      utilisateur.unlocked_features.add(Feature.bilan_carbone_detail);
      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.unlocked_features],
      );
    }

    bilan_synthese.bilan_complet_dispo =
      utilisateur.unlocked_features.isUnlocked(Feature.bilan_carbone_detail) ||
      utilisateur.vientDeNGC();

    const situation = this.external_compute_situation(utilisateur);
    const bilan_complet =
      this.nGCCalculator.computeBilanCarboneFromSituation(situation);

    return {
      bilan_synthese: bilan_synthese,
      bilan_complet: bilan_complet,
    };
  }

  public external_compute_situation(utilisateur: Utilisateur): SituationNGC {
    const situation = {};

    const kyc_liste = utilisateur.kyc_history.getAllUpToDateQuestionSet(true);
    for (const kyc of kyc_liste) {
      if (kyc.is_NGC) {
        if (!kyc.ngc_key) {
          console.error(
            `Missing ngc key for KYC [${kyc.id_cms}/${kyc.code}]  user [${utilisateur.id}]`,
          );
        } else {
          if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
            if (kyc.hasAnyComplexeResponse()) {
              situation[kyc.ngc_key] =
                kyc.getNGCCodeReponseQuestionChoixUnique();
            }
          }
          if (
            kyc.type === TypeReponseQuestionKYC.entier ||
            kyc.type === TypeReponseQuestionKYC.decimal
          ) {
            if (kyc.hasAnySimpleResponse()) {
              const value = kyc.getReponseSimpleValueAsNumber();
              situation[kyc.ngc_key] = Number.isNaN(value) ? 0 : value;
            }
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

    const avion = kyc_avion.isSelectedReponseCode('oui');
    const km = kyc_voiture.getReponseSimpleValueAsNumber();
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

  private async isBilanStatUpToDate(
    utilisateur: Utilisateur,
  ): Promise<boolean> {
    const bilan_last_update_time = utilisateur.cache_bilan_carbone.updated_at;

    const kyc_last_update = utilisateur.kyc_history.getLastUpdate().getTime();

    return (
      bilan_last_update_time &&
      bilan_last_update_time.getTime() > kyc_last_update
    );
  }

  private computeImpactAlimentation(utilisateur: Utilisateur): NiveauImpact {
    const kyc_regime = utilisateur.kyc_history.getUpToDateQuestionByCodeOrNull(
      KYCID.KYC_alimentation_regime,
    );
    if (!kyc_regime) return null;
    if (!kyc_regime.hasAnyResponses()) return null;

    const regime_code = kyc_regime.getCodeReponseQuestionChoixUnique();
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

    const code = kyc_type_conso.getCodeReponseQuestionChoixUnique();
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

    const is_fioul = kyc_fioul.getCodeReponseQuestionChoixUnique() === 'oui';
    const is_gaz = kyc_gaz.getCodeReponseQuestionChoixUnique() === 'oui';
    const is_elec = kyc_elec.getCodeReponseQuestionChoixUnique() === 'oui';
    const is_bois = kyc_bois.getCodeReponseQuestionChoixUnique() === 'oui';

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

    const nbr_hab = kyc_menage.getReponseSimpleValueAsNumber();
    const superficie = kyc_superficie.getReponseSimpleValueAsNumber();
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
