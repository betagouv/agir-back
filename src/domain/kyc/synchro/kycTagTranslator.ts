import { TagExcluant } from '../../scoring/tagExcluant';
import { KYCHistory } from '../kycHistory';
import { KYCID } from '../KYCID';
import { BooleanKYC } from '../QuestionKYCData';

export class KycTagExcluantTranslator {
  private hist: KYCHistory;

  constructor(hist: KYCHistory) {
    this.hist = hist;
  }

  static extractTagsFromKycs(hist: KYCHistory): Set<TagExcluant> {
    return new KycTagExcluantTranslator(hist).extract();
  }

  private extract(): Set<TagExcluant> {
    const result_set: Set<TagExcluant> = new Set();

    if (this.est_non(KYCID.KYC_transport_avion_3_annees)) {
      result_set.add(TagExcluant.ne_prend_pas_avion);
    }
    if (this.est_oui(KYCID.KYC003)) {
      result_set.add(TagExcluant.a_un_velo);
    }
    if (this.est_non(KYCID.KYC_possede_voiture_oui_non)) {
      result_set.add(TagExcluant.na_pas_de_voiture);
    }
    if (
      this.has_one_of(KYCID.KYC_transport_voiture_motorisation, [
        'thermique',
        'hybride',
      ])
    ) {
      result_set.add(TagExcluant.a_une_voiture_thermique);
    }
    if (this.is_code(KYCID.KYC_transport_voiture_motorisation, 'electrique')) {
      result_set.add(TagExcluant.a_une_voiture_electrique);
    }
    if (this.est_zero(KYCID.KYC_nbr_plats_viande_rouge)) {
      result_set.add(TagExcluant.ne_mange_pas_de_viande_rouge);
    }
    if (
      this.est_zero(KYCID.KYC_nbr_plats_viande_rouge) &&
      this.est_zero(KYCID.KYC_nbr_plats_viande_blanche)
    ) {
      result_set.add(TagExcluant.ne_mange_pas_de_viande);
    }
    if (this.is_code(KYCID.KYC_saison_frequence, 'toujours')) {
      result_set.add(TagExcluant.mange_de_saison);
    }
    if (this.is_code(KYCID.KYC_saison_frequence, 'jamais')) {
      result_set.add(TagExcluant.ne_mange_de_saison);
    }
    if (this.est_oui(KYCID.KYC_alimentation_compostage)) {
      result_set.add(TagExcluant.composte);
    }
    if (this.est_non(KYCID.KYC_alimentation_compostage)) {
      result_set.add(TagExcluant.ne_composte_pas);
    }
    if (this.is_code(KYCID.KYC_local_frequence, 'jamais')) {
      result_set.add(TagExcluant.ne_mange_pas_local);
    }
    if (this.is_code(KYCID.KYC_local_frequence, 'toujours')) {
      result_set.add(TagExcluant.mange_local);
    }
    if (this.is_code(KYCID.KYC_type_logement, 'type_maison')) {
      result_set.add(TagExcluant.vit_en_maison);
    }
    if (this.is_code(KYCID.KYC_type_logement, 'type_appartement')) {
      result_set.add(TagExcluant.vit_en_appart);
    }
    // OK
    if (this.est_non(KYCID.KYC_proprietaire)) {
      result_set.add(TagExcluant.est_locataire);
    }
    // OK
    if (this.est_oui(KYCID.KYC_proprietaire)) {
      result_set.add(TagExcluant.est_proprietaire);
    }
    if (this.est_oui(KYCID.KYC_jardin)) {
      result_set.add(TagExcluant.a_un_jardin);
    }
    if (this.est_non(KYCID.KYC_jardin)) {
      result_set.add(TagExcluant.na_pas_de_jardin);
    }
    if (this.est_oui(KYCID.KYC_chauffage_elec)) {
      result_set.add(TagExcluant.a_chauffage_elec);
    }
    if (this.est_non(KYCID.KYC_chauffage_elec)) {
      result_set.add(TagExcluant.na_pas_de_chauffage_elec);
    }
    if (this.est_oui(KYCID.KYC_logement_reno_chauffage)) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.est_oui(KYCID.KYC_logement_reno_extension)) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.est_oui(KYCID.KYC_logement_reno_isolation)) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.est_oui(KYCID.KYC_logement_reno_second_oeuvre)) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.is_code(KYCID.KYC_consommation_relation_objets, 'maximum')) {
      result_set.add(TagExcluant.prend_soin_objets);
    }
    if (
      this.has_one_of(KYCID.KYC_consommation_type_consommateur, [
        'achete_jamais',
        'seconde_main',
      ])
    ) {
      result_set.add(TagExcluant.achete_peu_et_occasion);
    }

    return result_set;
  }

  private est_oui(kyc_code: string): boolean {
    const kyc = this.hist.getQuestionChoixUnique(kyc_code);
    if (!kyc) return false;
    return kyc.isSelected(BooleanKYC.oui);
  }
  private est_non(kyc_code: string): boolean {
    const kyc = this.hist.getQuestionChoixUnique(kyc_code);
    if (!kyc) return false;
    return kyc.isSelected(BooleanKYC.non);
  }
  private est_zero(kyc_code: string): boolean {
    const kyc = this.hist.getQuestionNumerique(kyc_code);
    if (!kyc) return false;
    return kyc.getValue() === 0;
  }
  private is_code(kyc_code: string, code: string): boolean {
    const kyc = this.hist.getQuestionChoix(kyc_code);
    if (!kyc) return false;
    return kyc.isSelected(code);
  }
  private has_one_of(kyc_code: string, code_liste: string[]): boolean {
    const kyc = this.hist.getQuestionChoix(kyc_code);
    if (!kyc) return false;
    for (const code of code_liste) {
      if (kyc.isSelected(code)) return true;
    }
    return false;
  }
}
