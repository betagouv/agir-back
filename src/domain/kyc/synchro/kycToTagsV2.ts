import {
  CommuneRepository,
  TypeCommune,
} from '../../../infrastructure/repository/commune/commune.repository';
import { Logement } from '../../logement/logement';
import { ProfileRecommandationUtilisateur } from '../../scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../scoring/system_v2/Tag_v2';
import { KYCHistory } from '../kycHistory';
import { KYCID } from '../KYCID';
import { BooleanKYC } from '../QuestionKYCData';

type OUI_NON = {
  oui?: Tag_v2[];
  non?: Tag_v2[];
};
type CODE_TAG = Record<string, Tag_v2>;

export type KycToTagMapper = {
  oui_non?: OUI_NON;
  is_zero?: OUI_NON;
  both_zero?: { kyc: KYCID } & OUI_NON;
  one_of?: { set: string[] } & OUI_NON;
  is_code?: { code: string } & OUI_NON;
  are_codes?: ({ code: string } & OUI_NON)[];
  distribute?: CODE_TAG;
};

const KYC_TAG_MAPPER_COLLECTION: {
  [key in KYCID]?: KycToTagMapper;
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
  KYC_transport_voiture_motorisation: {
    one_of: {
      set: ['thermique', 'hybride'],
      oui: [Tag_v2.a_une_voiture_thermique],
    },
    is_code: { code: 'electrique', oui: [Tag_v2.a_une_voiture_electrique] },
  },
  KYC_consommation_relation_objets: {
    one_of: {
      set: ['achete_jamais', 'seconde_main'],
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

  constructor(
    hist: KYCHistory,
    logement: Logement,
    commune_repo: CommuneRepository,
  ) {
    this.hist = hist;
    this.new_tag_set = new Set();
    this.logement = logement;
    this.commune_repo = commune_repo;
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
        for (const [code, tag] of Object.entries(mappers.distribute)) {
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

    if (this.logement && this.logement.code_commune) {
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
    }

    profile.replaceAllTags(this.new_tag_set);
  }

  private is_code(kyc_code: string, code: string): boolean {
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

  private has_one_of(kyc_code: string, code_liste: string[]): boolean {
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
}
