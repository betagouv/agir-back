import { KYCHistory } from '../../kyc/kycHistory';
import { KYCID } from '../../kyc/KYCID';
import { BooleanKYC, QuestionKYC } from '../../kyc/questionKYC';
import { TagExcluant } from '../../scoring/tagExcluant';

export class KycTagExcluantTranslator {
  static extractTagsFromKycs(hist: KYCHistory): Set<TagExcluant> {
    const result_set: Set<TagExcluant> = new Set();

    if (this.est_non(this.getKYC(hist, KYCID.KYC_transport_avion_3_annees))) {
      result_set.add(TagExcluant.ne_prend_pas_avion);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC003))) {
      result_set.add(TagExcluant.a_un_velo);
    }
    if (
      this.code_l(this.getKYC(hist, KYCID.KYC009), [
        'loc_voit',
        'co_voit',
        'pas_voiture',
      ])
    ) {
      result_set.add(TagExcluant.na_pas_de_voiture);
    }
    if (!!this.getKYC(hist, KYCID.KYC_transport_voiture_thermique_carburant)) {
      result_set.add(TagExcluant.a_une_voiture_thermique);
    }
    if (this.est_zero(this.getKYC(hist, KYCID.KYC_nbr_plats_viande_rouge))) {
      result_set.add(TagExcluant.ne_mange_pas_de_viande_rouge);
    }
    if (
      this.est_zero(this.getKYC(hist, KYCID.KYC_nbr_plats_viande_rouge)) &&
      this.est_zero(this.getKYC(hist, KYCID.KYC_nbr_plats_viande_blanche))
    ) {
      result_set.add(TagExcluant.ne_mange_pas_de_viande);
    }
    if (this.code(this.getKYC(hist, KYCID.KYC_saison_frequence), 'toujours')) {
      result_set.add(TagExcluant.mange_de_saison);
    }
    if (this.code(this.getKYC(hist, KYCID.KYC_saison_frequence), 'jamais')) {
      result_set.add(TagExcluant.ne_mange_de_saison);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_alimentation_compostage))) {
      result_set.add(TagExcluant.composte);
    }
    if (this.est_non(this.getKYC(hist, KYCID.KYC_alimentation_compostage))) {
      result_set.add(TagExcluant.ne_composte_pas);
    }
    if (this.code(this.getKYC(hist, KYCID.KYC_local_frequence), 'jamais')) {
      result_set.add(TagExcluant.ne_mange_pas_local);
    }
    if (this.code(this.getKYC(hist, KYCID.KYC_local_frequence), 'toujours')) {
      result_set.add(TagExcluant.mange_local);
    }
    if (this.code(this.getKYC(hist, KYCID.KYC_type_logement), 'type_maison')) {
      result_set.add(TagExcluant.vit_en_maison);
    }
    if (
      this.code(this.getKYC(hist, KYCID.KYC_type_logement), 'type_appartement')
    ) {
      result_set.add(TagExcluant.vit_en_appart);
    }
    if (this.est_non(this.getKYC(hist, KYCID.KYC_proprietaire))) {
      result_set.add(TagExcluant.est_locataire);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_proprietaire))) {
      result_set.add(TagExcluant.est_proprietaire);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_jardin))) {
      result_set.add(TagExcluant.a_un_jardin);
    }
    if (this.est_non(this.getKYC(hist, KYCID.KYC_jardin))) {
      result_set.add(TagExcluant.na_pas_de_jardin);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_chauffage_elec))) {
      result_set.add(TagExcluant.a_chauffage_elec);
    }
    if (this.est_non(this.getKYC(hist, KYCID.KYC_chauffage_elec))) {
      result_set.add(TagExcluant.na_pas_de_chauffage_elec);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_logement_reno_chauffage))) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_logement_reno_extension))) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (this.est_oui(this.getKYC(hist, KYCID.KYC_logement_reno_isolation))) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (
      this.est_oui(this.getKYC(hist, KYCID.KYC_logement_reno_second_oeuvre))
    ) {
      result_set.add(TagExcluant.a_fait_travaux_recents);
    }
    if (
      this.code(
        this.getKYC(hist, KYCID.KYC_consommation_relation_objets),
        'maximum',
      )
    ) {
      result_set.add(TagExcluant.prend_soin_objets);
    }
    if (
      this.code_l(this.getKYC(hist, KYCID.KYC_consommation_type_consommateur), [
        'achete_jamais',
        'seconde_main',
      ])
    ) {
      result_set.add(TagExcluant.achete_peu_et_occasion);
    }

    return result_set;
  }

  private static est_oui(kyc: QuestionKYC): boolean {
    if (!kyc) return false;
    return kyc.getSelectedCodes().includes(BooleanKYC.oui);
  }
  private static est_non(kyc: QuestionKYC): boolean {
    if (!kyc) return false;
    return kyc.getSelectedCodes().includes(BooleanKYC.non);
  }
  private static est_zero(kyc: QuestionKYC): boolean {
    if (!kyc) return false;
    return kyc.getReponseSimpleValueAsNumber() === 0;
  }
  private static code(kyc: QuestionKYC, code: string): boolean {
    if (!kyc) return false;
    return kyc.getSelectedCodes().includes(code);
  }
  private static code_l(kyc: QuestionKYC, codes: string[]): boolean {
    if (!kyc) return false;
    const selected_codes = kyc.getSelectedCodes();
    for (const code of codes) {
      if (selected_codes.includes(code)) return true;
    }
    return false;
  }

  private static getKYC(history: KYCHistory, code: KYCID) {
    return history.getAnsweredQuestionByCode(code);
  }
}
