import {
  CommuneRepository,
  TypeCommune,
} from '../../../infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../../../infrastructure/repository/risquesNaturelsCommunes.repository';
import { KYCHistory } from '../../kyc/kycHistory';
import { KYCID } from '../../kyc/KYCID';
import { KYCComplexValues } from '../../kyc/publicodesMapping';
import { BooleanKYC } from '../../kyc/QuestionKYCData';
import { Logement } from '../../logement/logement';
import { NiveauRisqueLogement } from '../../logement/NiveauRisque';
import { ProfileRecommandationUtilisateur } from './profileRecommandationUtilisateur';
import { Tag_v2 } from './Tag_v2';

type OUI_NON = {
  oui?: Tag_v2[];
  non?: Tag_v2[];
};
type CODE_TAG = Record<string, Tag_v2>;

export type KycToTagMapper<T extends KYCID> = {
  oui_non?: OUI_NON;
  is_zero?: OUI_NON;
  is_equal?: { value: number } & OUI_NON;
  is_lesser_than?: { value: number } & OUI_NON;
  is_greater_than?: { value: number } & OUI_NON;
  both_zero?: { kyc: KYCID } & OUI_NON;
  one_of?: { set: KYCComplexValues[T]['code'][] } & OUI_NON;
  is_code?: { code: KYCComplexValues[T]['code'] } & OUI_NON;
  are_codes?: ({ code: KYCComplexValues[T]['code'] } & OUI_NON)[];
  distribute?: CODE_TAG;
};

export const KYC_TAG_MAPPER_COLLECTION: {
  [key in KYCID]?: KycToTagMapper<key>;
} = {
  KYC_proprietaire: {
    oui_non: {
      oui: [Tag_v2.est_proprietaire],
      non: [Tag_v2.n_est_pas_proprietaire],
    },
  },
  KYC_transport_avion_3_annees: {
    oui_non: {
      non: [Tag_v2.ne_prend_pas_avion],
      oui: [Tag_v2.prend_l_avion],
    },
  },
  KYC003: {
    oui_non: {
      oui: [Tag_v2.a_un_velo],
    },
  },
  // NOTE(@EmileRolley): quid des deux autres questions sur la possession de voiture ?
  KYC_possede_voiture_oui_non: {
    oui_non: {
      oui: [Tag_v2.a_une_voiture],
      non: [Tag_v2.n_a_pas_de_voiture],
    },
  },
  KYC_alimentation_compostage: {
    oui_non: {
      oui: [Tag_v2.composte],
      non: [Tag_v2.ne_composte_pas],
    },
  },
  KYC_jardin: {
    oui_non: {
      oui: [Tag_v2.a_un_jardin],
      non: [Tag_v2.n_a_pas_de_jardin],
    },
  },
  KYC_chauffage_elec: {
    oui_non: {
      oui: [Tag_v2.a_chauffage_elec],
      non: [Tag_v2.n_a_pas_chauffage_elec],
    },
  },
  KYC_menage: {
    is_greater_than: {
      value: 2,
      oui: [Tag_v2.vit_en_famille],
    },
    is_lesser_than: {
      value: 3,
      oui: [Tag_v2.ne_vit_pas_en_famille],
    },
  },

  KYC_transport_voiture_motorisation: {
    are_codes: [
      {
        code: 'thermique',
        oui: [Tag_v2.a_une_voiture_thermique],
      },
      {
        code: 'hybride_non_rechargeable',
        oui: [Tag_v2.a_une_voiture_thermique],
      },
      {
        code: 'hybride_rechargeable',
        oui: [Tag_v2.a_une_voiture_electrique],
      },
      {
        code: 'electrique',
        oui: [Tag_v2.a_une_voiture_electrique],
      },
    ],
  },
  KYC_consommation_relation_objets: {
    one_of: {
      set: ['faible', 'moyen'],
      oui: [Tag_v2.achete_peu_et_occasion],
    },
    is_code: {
      code: 'maximum',
      oui: [Tag_v2.prend_soin_objets],
    },
  },
  KYC_local_frequence: {
    are_codes: [
      {
        code: 'toujours',
        oui: [Tag_v2.mange_local],
      },
      {
        code: 'jamais',
        oui: [Tag_v2.ne_mange_pas_local],
      },
    ],
  },
  KYC_saison_frequence: {
    are_codes: [
      {
        code: 'jamais',
        oui: [Tag_v2.ne_mange_pas_de_saison],
      },
      {
        code: 'toujours',
        oui: [Tag_v2.mange_de_saison],
      },
    ],
  },
  KYC_nbr_plats_viande_rouge: {
    is_zero: {
      oui: [Tag_v2.ne_mange_pas_de_viande_rouge],
    },
    both_zero: {
      kyc: KYCID.KYC_nbr_plats_viande_blanche,
      oui: [Tag_v2.ne_mange_pas_de_viande],
    },
  },
  KYC_logement_reno_chauffage: {
    oui_non: { oui: [Tag_v2.a_fait_travaux_recents] },
  },
  KYC_logement_reno_extension: {
    oui_non: { oui: [Tag_v2.a_fait_travaux_recents] },
  },
  KYC_logement_reno_isolation: {
    oui_non: { oui: [Tag_v2.a_fait_travaux_recents] },
  },
  KYC_logement_reno_second_oeuvre: {
    oui_non: { oui: [Tag_v2.a_fait_travaux_recents] },
  },
  KYC_preference: {
    distribute: {
      alimentation: Tag_v2.appetence_thematique_alimentation,
      transport: Tag_v2.appetence_thematique_transport,
      logement: Tag_v2.appetence_thematique_logement,
      consommation: Tag_v2.appetence_thematique_consommation,
    },
  },
};

export class KycToTags_v2 {
  private hist: KYCHistory;
  private new_tag_set: Set<Tag_v2>;
  private logement: Logement;
  private commune_repo: CommuneRepository;
  private risquesNaturelsCommunesRepository: RisquesNaturelsCommunesRepository;

  constructor(
    hist: KYCHistory,
    logement: Logement,
    commune_repo: CommuneRepository,
    risquesNaturelsCommunesRepository: RisquesNaturelsCommunesRepository,
  ) {
    this.hist = hist;
    this.new_tag_set = new Set();
    this.logement = logement;
    this.commune_repo = commune_repo;
    this.risquesNaturelsCommunesRepository = risquesNaturelsCommunesRepository;
  }

  public static generate_dependency_report(): Map<KYCID, Set<Tag_v2>> {
    const result_map: Map<KYCID, Set<Tag_v2>> = new Map();

    for (const [kyc_id, mappers] of Object.entries(KYC_TAG_MAPPER_COLLECTION)) {
      const tag_set: Set<Tag_v2> = new Set();

      if (mappers.oui_non) {
        mappers.oui_non.oui?.forEach((t) => tag_set.add(t));
        mappers.oui_non.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.is_zero) {
        mappers.is_zero.oui?.forEach((t) => tag_set.add(t));
        mappers.is_zero.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.is_equal) {
        mappers.is_equal.oui?.forEach((t) => tag_set.add(t));
        mappers.is_equal.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.is_greater_than) {
        mappers.is_greater_than.oui?.forEach((t) => tag_set.add(t));
        mappers.is_greater_than.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.is_lesser_than) {
        mappers.is_lesser_than.oui?.forEach((t) => tag_set.add(t));
        mappers.is_lesser_than.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.both_zero) {
        mappers.both_zero.oui?.forEach((t) => tag_set.add(t));
        mappers.both_zero.non?.forEach((t) => tag_set.add(t));
        let other_set = result_map.get(mappers.both_zero.kyc);
        if (!other_set) {
          other_set = new Set();
        }
        mappers.both_zero.oui?.forEach((t) => other_set.add(t));
        mappers.both_zero.non?.forEach((t) => other_set.add(t));
        result_map.set(mappers.both_zero.kyc, other_set);
      }
      if (mappers.one_of) {
        mappers.one_of.oui?.forEach((t) => tag_set.add(t));
        mappers.one_of.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.is_code) {
        mappers.is_code.oui?.forEach((t) => tag_set.add(t));
        mappers.is_code.non?.forEach((t) => tag_set.add(t));
      }
      if (mappers.are_codes) {
        for (const code of mappers.are_codes) {
          code.oui?.forEach((t) => tag_set.add(t));
          code.non?.forEach((t) => tag_set.add(t));
        }
      }
      if (mappers.distribute) {
        for (const [_, tag] of Object.entries(mappers.distribute)) {
          tag_set.add(tag);
        }
      }

      result_map.set(KYCID[kyc_id], tag_set);
    }

    return result_map;
  }

  public refreshTagState_v2(profile: ProfileRecommandationUtilisateur) {
    for (const [kyc_code, mapper] of Object.entries(
      KYC_TAG_MAPPER_COLLECTION,
    )) {
      if (mapper.oui_non) {
        this.distribuerOuiNonKYC(KYCID[kyc_code], mapper.oui_non);
      }
      if (mapper.one_of) {
        this.distribuerOuiNonBoolean(
          this.has_one_of(KYCID[kyc_code], mapper.one_of.set),
          { oui: mapper.one_of.oui, non: mapper.one_of.non },
        );
      }
      if (mapper.is_code) {
        this.distribuerOuiNonBoolean(
          this.is_code(KYCID[kyc_code], mapper.is_code.code),
          { oui: mapper.one_of.oui, non: mapper.one_of.non },
        );
      }
      if (mapper.are_codes) {
        for (const is_code of mapper.are_codes) {
          this.distribuerOuiNonBoolean(
            this.is_code(KYCID[kyc_code], is_code.code),
            { oui: is_code.oui, non: is_code.non },
          );
        }
      }
      if (mapper.is_zero) {
        this.distribuerOuiNonBoolean(this.est_zero(KYCID[kyc_code]), {
          oui: mapper.is_zero.oui,
          non: mapper.is_zero.non,
        });
      }
      if (mapper.is_equal) {
        this.distribuerOuiNonBoolean(
          this.est_egale(KYCID[kyc_code], mapper.is_equal.value),
          {
            oui: mapper.is_equal.oui,
            non: mapper.is_equal.non,
          },
        );
      }
      if (mapper.is_greater_than) {
        this.distribuerOuiNonBoolean(
          this.est_plus_grande(KYCID[kyc_code], mapper.is_greater_than.value),
          {
            oui: mapper.is_greater_than.oui,
            non: mapper.is_greater_than.non,
          },
        );
      }
      if (mapper.is_lesser_than) {
        this.distribuerOuiNonBoolean(
          this.est_plus_petite(KYCID[kyc_code], mapper.is_lesser_than.value),
          {
            oui: mapper.is_lesser_than.oui,
            non: mapper.is_lesser_than.non,
          },
        );
      }
      if (mapper.both_zero) {
        this.distribuerOuiNonBoolean(
          this.est_zero(KYCID[kyc_code]) &&
            this.est_zero(KYCID[mapper.both_zero.kyc]),
          {
            oui: mapper.both_zero.oui,
            non: mapper.both_zero.non,
          },
        );
      }
      if (mapper.distribute) {
        this.distribuerChoixMultiple(KYCID[kyc_code], mapper.distribute);
      }
    }

    if (this.logement) {
      if (this.logement.code_commune) {
        const niveau = this.commune_repo.getNiveauUrbainCommune(
          this.logement.code_commune,
        );
        switch (niveau) {
          case TypeCommune.Rural:
            this.setTags([Tag_v2.habite_zone_rurale]);
            break;
          case TypeCommune.Urbain:
            this.setTags([Tag_v2.habite_zone_urbaine]);
            break;
          case TypeCommune['Péri-urbain']:
            this.setTags([Tag_v2.habite_zone_peri_urbaine]);
            break;
        }

        const est_drom_com = this.commune_repo.estDromCom(
          this.logement.code_commune,
        );
        if (est_drom_com) {
          this.setTags([Tag_v2.habite_en_outre_mer]);
        } else {
          this.setTags([Tag_v2.habite_en_metropole]);
        }

        const risque_commune =
          this.risquesNaturelsCommunesRepository.getRisquesCommune(
            this.logement.code_commune,
          );
        if (risque_commune) {
          if (risque_commune.nombre_cat_nat > 10) {
            this.setTags([Tag_v2.risque_commune_catnat]);
          }
          if (risque_commune.pourcentage_risque_innondation > 10) {
            this.setTags([Tag_v2.risque_commune_inondation]);
          }
          if (risque_commune.pourcentage_risque_secheresse > 50) {
            this.setTags([Tag_v2.risque_commune_argile]);
          }
        }
      }
      if (
        this.logement.score_risques_adresse &&
        this.logement.score_risques_adresse.isDefined()
      ) {
        if (
          this.estRisqueMoyenOuPlus(this.logement.score_risques_adresse.argile)
        ) {
          this.setTags([Tag_v2.risque_adresse_argile]);
        }
        if (
          this.estRisqueMoyenOuPlus(
            this.logement.score_risques_adresse.inondation,
          )
        ) {
          this.setTags([Tag_v2.risque_adresse_inondation]);
        }
        if (
          this.estRisqueMoyenOuPlus(this.logement.score_risques_adresse.radon)
        ) {
          this.setTags([Tag_v2.risque_adresse_radon]);
        }
        if (
          this.estRisqueMoyenOuPlus(
            this.logement.score_risques_adresse.secheresse,
          )
        ) {
          this.setTags([Tag_v2.risque_adresse_secheresse]);
        }
        if (
          this.estRisqueMoyenOuPlus(this.logement.score_risques_adresse.seisme)
        ) {
          this.setTags([Tag_v2.risque_adresse_seisme]);
        }
        if (
          this.estRisqueMoyenOuPlus(
            this.logement.score_risques_adresse.submersion,
          )
        ) {
          this.setTags([Tag_v2.risque_adresse_submersion]);
        }
        if (
          this.estRisqueMoyenOuPlus(this.logement.score_risques_adresse.tempete)
        ) {
          this.setTags([Tag_v2.risque_adresse_tempete]);
        }
      }
    }

    profile.replaceAllTags(this.new_tag_set);
  }

  private is_code(kyc_code: KYCID, code: string): boolean {
    const kyc = this.hist.getQuestionChoix(kyc_code);
    if (!kyc) return false;
    return kyc.isSelected(code);
  }

  private distribuerOuiNonBoolean(oui: boolean, tags: OUI_NON) {
    if (oui) {
      this.setTags(tags.oui);
    } else {
      this.setTags(tags.non);
    }
  }
  private distribuerOuiNonKYC(kyc_code: KYCID, tags: OUI_NON) {
    const kyc = this.hist.getQuestionChoixUnique(kyc_code);
    if (!kyc) return;
    if (kyc.isSelected(BooleanKYC.oui)) {
      this.setTags(tags.oui);
    } else if (kyc.isSelected(BooleanKYC.non)) {
      this.setTags(tags.non);
    }
  }
  private distribuerChoixMultiple(kyc_code: KYCID, mapping: CODE_TAG) {
    const kyc = this.hist.getQuestionChoixMultiple(kyc_code);
    if (!kyc) return;
    for (const [code, tag] of Object.entries(mapping)) {
      if (kyc.isSelected(code)) {
        this.new_tag_set.add(tag);
      } else {
        this.new_tag_set.delete(tag);
      }
    }
  }

  private setTags(tags: Tag_v2[]) {
    if (tags) {
      for (const tag of tags) {
        this.new_tag_set.add(tag);
      }
    }
  }

  private has_one_of(kyc_code: KYCID, code_liste: string[]): boolean {
    const kyc = this.hist.getQuestionChoix(kyc_code);
    if (!kyc) return false;
    for (const code of code_liste) {
      if (kyc.isSelected(code)) return true;
    }
    return false;
  }

  private est_zero(kyc_code: string): boolean {
    const kyc = this.hist.getQuestionNumerique(kyc_code);
    if (!kyc) return false;
    return kyc.getValue() === 0;
  }
  private est_egale(kyc_code: string, value: number): boolean {
    const kyc = this.hist.getQuestionNumerique(kyc_code);
    if (!kyc) return false;
    return kyc.getValue() === value;
  }
  private est_plus_grande(kyc_code: string, value: number): boolean {
    const kyc = this.hist.getQuestionNumerique(kyc_code);
    if (!kyc) return false;
    return kyc.getValue() > value;
  }
  private est_plus_petite(kyc_code: string, value: number): boolean {
    const kyc = this.hist.getQuestionNumerique(kyc_code);
    if (!kyc) return false;
    return kyc.getValue() < value;
  }

  private estRisqueMoyenOuPlus(level: NiveauRisqueLogement): boolean {
    return (
      level !== undefined &&
      (level === NiveauRisqueLogement.moyen ||
        level === NiveauRisqueLogement.fort ||
        level === NiveauRisqueLogement.tres_fort)
    );
  }
}
