import { Injectable } from '@nestjs/common';
import {
  BilanCarbone,
  BilanCarboneSynthese,
  ImpactThematiqueStandalone,
  NiveauImpact,
  SituationNGC,
} from '../domain/bilan/bilanCarbone';
import { KYCID } from '../domain/kyc/KYCID';
import { KYCMosaicID } from '../domain/kyc/KYCMosaicID';
import { QuestionChoixUnique } from '../domain/kyc/new_interfaces/QuestionChoixUnique';
import { QuestionNumerique } from '../domain/kyc/new_interfaces/QuestionNumerique';
import { QuestionKYC } from '../domain/kyc/questionKYC';
import {
  BooleanKYC,
  TypeReponseQuestionKYC,
} from '../domain/kyc/QuestionKYCData';
import { SituationNgcToKycSync } from '../domain/kyc/synchro/situationNgcToKycSync';
import { Thematique } from '../domain/thematique/thematique';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { NGCCalculator } from '../infrastructure/ngc/NGCCalculator';
import { KycRepository } from '../infrastructure/repository/kyc.repository';
import { SituationNGCRepository } from '../infrastructure/repository/situationNGC.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { QuestionKYCEnchainementUsecase } from './questionKYCEnchainement.usecase';

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

  pourcentage_prog_totale_sans_mini_bilan: number;
};

@Injectable()
export class BilanCarboneUsecase {
  constructor(
    private nGCCalculator: NGCCalculator,
    private utilisateurRepository: UtilisateurRepository,
    private situationRepository: SituationNGCRepository,
  ) {}

  async reInjecterSituationsNGC(block_size = 200): Promise<string[]> {
    const result = [];
    const total = await this.situationRepository.countAllWithUserId();
    for (let index = 0; index < total; index = index + block_size) {
      const current_situation_id_list =
        await this.situationRepository.listeIdsLinkedToUser(index, block_size);

      for (const situation of current_situation_id_list) {
        const user = await this.utilisateurRepository.getById(
          situation.user_id,
          [Scope.kyc, Scope.logement, Scope.cache_bilan_carbone],
        );

        const updated_keys = await this.external_inject_situation_to_user_kycs(
          user,
          situation.id,
        );
        if (updated_keys.length > 0) {
          result.push(`Set on user ${user.id} : ` + updated_keys.join('|'));
          await this.utilisateurRepository.updateUtilisateur(user);
        }
      }
    }
    return result;
  }

  async external_inject_situation_to_user_kycs(
    utilisateur: Utilisateur,
    situation_ngc_id: string,
  ): Promise<string[]> {
    utilisateur.kyc_history.setCatalogue(KycRepository.getCatalogue());

    utilisateur.cache_bilan_carbone.est_bilan_complet = true;

    const situation = await this.situationRepository.getSituationNGCbyId(
      situation_ngc_id,
    );
    if (situation) {
      await this.situationRepository.setUtilisateurIdToSituation(
        utilisateur.id,
        situation_ngc_id,
      );

      const kyc_bilan = utilisateur.kyc_history.getQuestionChoixUnique(
        KYCID.KYC_bilan,
      );
      if (kyc_bilan) {
        kyc_bilan.selectByCode(BooleanKYC.oui);
        utilisateur.kyc_history.updateQuestion(kyc_bilan);
      }

      const updated_keys = SituationNgcToKycSync.synchronize(
        situation.situation as any,
        utilisateur,
      );

      utilisateur.kyc_history.flagMosaicsAsAnsweredWhenAtLeastOneQuestionAnswered();

      if (updated_keys.length > 0) {
        console.log(
          `Updated NGC kycs for ${utilisateur.email} : ${updated_keys.join(
            '|',
          )}`,
        );
      }
      return updated_keys;
    }
    return [];
  }

  async flagToutUtilisateurForcerCaclculStatsBilan(block_size = 200) {
    const total_user_count = await this.utilisateurRepository.countAll();

    for (let index = 0; index < total_user_count; index = index + block_size) {
      const current_user_list =
        await this.utilisateurRepository.listePaginatedUsers(
          index,
          block_size,
          [Scope.cache_bilan_carbone],
          {},
        );

      for (const user of current_user_list) {
        user.cache_bilan_carbone.forcer_calcul_stats = true;
        await this.utilisateurRepository.updateUtilisateurNoConcurency(user, [
          Scope.cache_bilan_carbone,
        ]);
      }
    }
  }

  async getCurrentBilanByUtilisateurId(utilisateurId: string): Promise<{
    bilan_complet: BilanCarbone;
    bilan_synthese: BilanCarboneSynthese;
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.kyc, Scope.logement, Scope.cache_bilan_carbone],
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
      [Scope.kyc, Scope.logement, Scope.cache_bilan_carbone],
    );
    Utilisateur.checkState(utilisateur);

    const situation = await this.external_compute_situation(utilisateur);

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

    const situation = await this.external_compute_situation(utilisateur);

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
        QuestionKYCEnchainementUsecase.ENCHAINEMENTS[
          'ENCHAINEMENT_KYC_mini_bilan_carbone'
        ],
      );

    let enchainement_transport =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCEnchainementUsecase.ENCHAINEMENTS[
          'ENCHAINEMENT_KYC_bilan_transport'
        ],
      );
    let enchainement_logement =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCEnchainementUsecase.ENCHAINEMENTS[
          'ENCHAINEMENT_KYC_bilan_logement'
        ],
      );
    let enchainement_conso =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCEnchainementUsecase.ENCHAINEMENTS[
          'ENCHAINEMENT_KYC_bilan_consommation'
        ],
      );
    let enchainement_alimentation =
      utilisateur.kyc_history.getEnchainementKYCsEligibles(
        QuestionKYCEnchainementUsecase.ENCHAINEMENTS[
          'ENCHAINEMENT_KYC_bilan_alimentation'
        ],
      );

    // CLEAN
    enchainement_transport = enchainement_transport.filter((q) => q !== null);
    enchainement_logement = enchainement_logement.filter((q) => q !== null);
    enchainement_conso = enchainement_conso.filter((q) => q !== null);
    enchainement_alimentation = enchainement_alimentation.filter(
      (q) => q !== null,
    );

    const enchainement_transport_progression = this.getProgression(
      enchainement_transport,
    );
    const enchainement_logement_progression = this.getProgression(
      enchainement_logement,
    );
    const enchainement_conso_progression =
      this.getProgression(enchainement_conso);
    const enchainement_alimentation_progression = this.getProgression(
      enchainement_alimentation,
    );
    const enchainement_minibilan_progression = this.getProgression(
      enchainement_mini_bilan,
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
      pourcentage_completion_totale:
        recap.pourcentage_prog_totale_sans_mini_bilan,
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
        SEUIL_POURCENTAGE_BILAN_COMPLET &&
      !utilisateur.cache_bilan_carbone.est_bilan_complet
    ) {
      utilisateur.cache_bilan_carbone.est_bilan_complet = true;
      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.cache_bilan_carbone],
      );
    }

    bilan_synthese.bilan_complet_dispo =
      utilisateur.cache_bilan_carbone.est_bilan_complet ||
      utilisateur.vientDeNGC();

    const situation = await this.external_compute_situation(utilisateur);
    const bilan_complet =
      this.nGCCalculator.computeBilanCarboneFromSituation(situation);

    return {
      bilan_synthese: bilan_synthese,
      bilan_complet: bilan_complet,
    };
  }

  public async external_compute_situation(
    utilisateur: Utilisateur,
  ): Promise<SituationNGC> {
    const situation =
      ((
        await this.situationRepository.getSituationByUtilisateurId(
          utilisateur.id,
        )
      )?.situation as SituationNGC) ?? {};

    const kyc_liste = utilisateur.kyc_history.getAllKycs();
    for (const kyc of kyc_liste) {
      if (kyc.is_NGC) {
        if (!kyc.ngc_key) {
          console.error(
            `Missing ngc key for KYC [${kyc.id_cms}/${kyc.code}]  user [${utilisateur.id}]`,
          );
        } else {
          if (kyc.type === TypeReponseQuestionKYC.choix_unique) {
            const choix_kyc = new QuestionChoixUnique(kyc);
            if (choix_kyc.isAnswered()) {
              situation[kyc.ngc_key] = choix_kyc.getSelectedNgcCode();
            }
          }
          if (
            kyc.type === TypeReponseQuestionKYC.entier ||
            kyc.type === TypeReponseQuestionKYC.decimal
          ) {
            if (kyc.hasAnySimpleResponse()) {
              const value = new QuestionNumerique(kyc).getValue();
              situation[kyc.ngc_key] = Number.isNaN(value) ? 0 : value;
            }
          }
        }
      }
    }
    return situation;
  }

  private computeImpactTransport(utilisateur: Utilisateur): NiveauImpact {
    const kyc_voiture = utilisateur.kyc_history.getQuestionNumerique(
      KYCID.KYC_transport_voiture_km,
    );
    if (!kyc_voiture) return null;
    if (!kyc_voiture.isAnswered()) return null;

    const kyc_avion = utilisateur.kyc_history.getQuestionChoixUnique(
      KYCID.KYC_transport_avion_3_annees,
    );
    if (!kyc_avion) return null;
    if (!kyc_avion.isAnswered()) return null;

    const avion = kyc_avion.isSelected('oui');
    const km = kyc_voiture.getValue();
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
    const kyc_regime = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_alimentation_regime,
    );
    if (!kyc_regime) return null;
    if (!kyc_regime.hasAnyResponses()) return null;

    const regime_code = kyc_regime.getSelectedCode();
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
    const kyc_type_conso = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_consommation_type_consommateur,
    );
    if (!kyc_type_conso) return null;
    if (!kyc_type_conso.hasAnyResponses()) return null;

    const code = kyc_type_conso.getSelectedCode();
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
    const kyc_menage = utilisateur.kyc_history.getQuestionNumerique(
      KYCID.KYC_menage,
    );
    if (!kyc_menage) return null;
    if (!kyc_menage.isAnswered()) return null;

    const kyc_superficie = utilisateur.kyc_history.getQuestionNumerique(
      KYCID.KYC_superficie,
    );
    if (!kyc_superficie) return null;
    if (!kyc_superficie.isAnswered()) return null;

    if (
      !utilisateur.kyc_history.isMosaicAnswered(KYCMosaicID.MOSAIC_CHAUFFAGE)
    ) {
      return null;
    }

    const kyc_bois = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_chauffage_bois,
    );
    if (!kyc_bois) return null;
    if (!kyc_bois.hasAnyResponses()) return null;

    const kyc_elec = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_chauffage_elec,
    );
    if (!kyc_elec) return null;
    if (!kyc_elec.hasAnyResponses()) return null;

    const kyc_gaz = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_chauffage_gaz,
    );
    if (!kyc_gaz) return null;
    if (!kyc_gaz.hasAnyResponses()) return null;

    const kyc_fioul = utilisateur.kyc_history.getQuestion(
      KYCID.KYC_chauffage_fioul,
    );
    if (!kyc_fioul) return null;
    if (!kyc_fioul.hasAnyResponses()) return null;

    const is_fioul = kyc_fioul.getSelectedCode() === 'oui';
    const is_gaz = kyc_gaz.getSelectedCode() === 'oui';
    const is_elec = kyc_elec.getSelectedCode() === 'oui';
    const is_bois = kyc_bois.getSelectedCode() === 'oui';

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

    const nbr_hab = kyc_menage.getValue();
    const superficie = kyc_superficie.getValue();
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

  private getProgression(liste: QuestionKYC[]): {
    current: number;
    target: number;
  } {
    let progression = 0;
    for (const question of liste) {
      if (question.is_answered) {
        progression++;
      }
    }
    return { current: progression, target: liste.length };
  }
}
