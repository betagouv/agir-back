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

type oui_non_autre = {
  oui: {
    set?: Tag_v2[];
    rm?: Tag_v2[];
  };
  non: {
    set?: Tag_v2[];
    rm?: Tag_v2[];
  };
  autre: {
    set?: Tag_v2[];
    rm?: Tag_v2[];
  };
};
type oui_non = {
  oui: {
    set?: Tag_v2[];
    rm?: Tag_v2[];
  };
  non: {
    set?: Tag_v2[];
    rm?: Tag_v2[];
  };
};
type code_tag = Record<string, Tag_v2>;

export class KycToTags_v2 {
  private hist: KYCHistory;
  private profile: ProfileRecommandationUtilisateur;
  private logement: Logement;
  private commune_repo: CommuneRepository;

  constructor(
    hist: KYCHistory,
    profile: ProfileRecommandationUtilisateur,
    logement: Logement,
    commune_repo: CommuneRepository,
  ) {
    this.hist = hist;
    this.profile = profile;
    this.logement = logement;
    this.commune_repo = commune_repo;
  }

  public refreshTagState() {
    if (this.logement && this.logement.code_commune) {
      const niveau = this.commune_repo.getNiveauUrbainCommune(
        this.logement.code_commune,
      );
      switch (niveau) {
        case TypeCommune.Rural:
          this.setTags([Tag_v2.habite_zone_rurale]);
          this.removeTags([
            Tag_v2.habite_zone_peri_urbaine,
            Tag_v2.habite_zone_urbaine,
          ]);
          break;
        case TypeCommune.Urbain:
          this.setTags([Tag_v2.habite_zone_urbaine]);
          this.removeTags([
            Tag_v2.habite_zone_peri_urbaine,
            Tag_v2.habite_zone_rurale,
          ]);
          break;
        case TypeCommune['Péri-urbain']:
          this.setTags([Tag_v2.habite_zone_peri_urbaine]);
          this.removeTags([
            Tag_v2.habite_zone_rurale,
            Tag_v2.habite_zone_urbaine,
          ]);
          break;

        default:
          this.removeTags([
            Tag_v2.habite_zone_rurale,
            Tag_v2.habite_zone_urbaine,
            Tag_v2.habite_zone_peri_urbaine,
          ]);
          break;
      }
    }

    this.distribuerChoixMultiple(KYCID.KYC_preference, {
      alimentation: Tag_v2.appetence_thematique_alimentation,
      transport: Tag_v2.appetence_thematique_transport,
      logement: Tag_v2.appetence_thematique_logement,
      consommation: Tag_v2.appetence_thematique_consommation,
    });

    this.distribuerOuiNonAutre(KYCID.KYC_proprietaire, {
      oui: {
        set: [Tag_v2.est_proprietaire],
        rm: [Tag_v2.n_est_pas_proprietaire],
      },
      non: {
        set: [Tag_v2.n_est_pas_proprietaire],
        rm: [Tag_v2.est_proprietaire],
      },
      autre: {
        rm: [Tag_v2.est_proprietaire, Tag_v2.n_est_pas_proprietaire],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC_transport_avion_3_annees, {
      oui: {
        rm: [Tag_v2.ne_prend_pas_avion],
      },
      non: {
        set: [Tag_v2.ne_prend_pas_avion],
      },
      autre: {
        rm: [Tag_v2.ne_prend_pas_avion],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC003, {
      oui: {
        set: [Tag_v2.a_un_velo],
      },
      non: {
        rm: [Tag_v2.a_un_velo],
      },
      autre: {
        rm: [Tag_v2.a_un_velo],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC_possede_voiture_oui_non, {
      oui: {
        set: [Tag_v2.a_une_voiture],
        rm: [Tag_v2.n_a_pas_de_voiture],
      },
      non: {
        set: [Tag_v2.n_a_pas_de_voiture],
        rm: [Tag_v2.a_une_voiture],
      },
      autre: {
        rm: [Tag_v2.a_une_voiture, Tag_v2.n_a_pas_de_voiture],
      },
    });

    this.distribuerOuiNon(
      this.has_one_of(KYCID.KYC_transport_voiture_motorisation, [
        'thermique',
        'hybride',
      ]),
      {
        oui: {
          set: [Tag_v2.a_une_voiture_thermique],
        },
        non: {
          rm: [Tag_v2.a_une_voiture_thermique],
        },
      },
    );

    this.distribuerOuiNon(
      this.is_code(KYCID.KYC_transport_voiture_motorisation, 'electrique'),
      {
        oui: {
          set: [Tag_v2.a_une_voiture_electrique],
        },
        non: {
          rm: [Tag_v2.a_une_voiture_electrique],
        },
      },
    );

    this.distribuerOuiNon(this.est_zero(KYCID.KYC_nbr_plats_viande_rouge), {
      oui: {
        set: [Tag_v2.ne_mange_pas_de_viande_rouge],
      },
      non: {
        rm: [Tag_v2.ne_mange_pas_de_viande_rouge],
      },
    });

    this.distribuerOuiNon(
      this.est_zero(KYCID.KYC_nbr_plats_viande_rouge) &&
        this.est_zero(KYCID.KYC_nbr_plats_viande_blanche),
      {
        oui: {
          set: [Tag_v2.ne_mange_pas_de_viande],
        },
        non: {
          rm: [Tag_v2.ne_mange_pas_de_viande],
        },
      },
    );

    this.distribuerOuiNon(
      this.is_code(KYCID.KYC_saison_frequence, 'toujours'),
      {
        oui: {
          set: [Tag_v2.mange_de_saison],
        },
        non: {
          rm: [Tag_v2.mange_de_saison],
        },
      },
    );

    this.distribuerOuiNon(this.is_code(KYCID.KYC_saison_frequence, 'jamais'), {
      oui: {
        set: [Tag_v2.ne_mange_pas_de_saison],
      },
      non: {
        rm: [Tag_v2.ne_mange_pas_de_saison],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC_alimentation_compostage, {
      oui: {
        set: [Tag_v2.composte],
        rm: [Tag_v2.ne_composte_pas],
      },
      non: {
        set: [Tag_v2.ne_composte_pas],
        rm: [Tag_v2.composte],
      },
      autre: {
        rm: [Tag_v2.ne_composte_pas, Tag_v2.composte],
      },
    });

    this.distribuerOuiNon(this.is_code(KYCID.KYC_local_frequence, 'jamais'), {
      oui: {
        set: [Tag_v2.ne_mange_pas_local],
      },
      non: {
        rm: [Tag_v2.ne_mange_pas_local],
      },
    });

    this.distribuerOuiNon(this.is_code(KYCID.KYC_local_frequence, 'toujours'), {
      oui: {
        set: [Tag_v2.mange_local],
      },
      non: {
        rm: [Tag_v2.mange_local],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC_jardin, {
      oui: {
        set: [Tag_v2.a_un_jardin],
        rm: [Tag_v2.n_a_pas_de_jardin],
      },
      non: {
        set: [Tag_v2.n_a_pas_de_jardin],
        rm: [Tag_v2.a_un_jardin],
      },
      autre: {
        rm: [Tag_v2.a_un_jardin, Tag_v2.n_a_pas_de_jardin],
      },
    });

    this.distribuerOuiNonAutre(KYCID.KYC_chauffage_elec, {
      oui: {
        set: [Tag_v2.a_chauffage_elec],
        rm: [Tag_v2.n_a_pas_chauffage_elec],
      },
      non: {
        set: [Tag_v2.n_a_pas_chauffage_elec],
        rm: [Tag_v2.a_chauffage_elec],
      },
      autre: {
        rm: [Tag_v2.a_chauffage_elec, Tag_v2.n_a_pas_chauffage_elec],
      },
    });

    this.distribuerOuiNon(this.est_oui(KYCID.KYC_logement_reno_chauffage), {
      oui: {
        set: [Tag_v2.a_fait_travaux_recents],
      },
      non: {
        rm: [Tag_v2.a_fait_travaux_recents],
      },
    });

    this.distribuerOuiNon(this.est_oui(KYCID.KYC_logement_reno_extension), {
      oui: {
        set: [Tag_v2.a_fait_travaux_recents],
      },
      non: {
        rm: [Tag_v2.a_fait_travaux_recents],
      },
    });

    this.distribuerOuiNon(this.est_oui(KYCID.KYC_logement_reno_isolation), {
      oui: {
        set: [Tag_v2.a_fait_travaux_recents],
      },
      non: {
        rm: [Tag_v2.a_fait_travaux_recents],
      },
    });

    this.distribuerOuiNon(this.est_oui(KYCID.KYC_logement_reno_second_oeuvre), {
      oui: {
        set: [Tag_v2.a_fait_travaux_recents],
      },
      non: {
        rm: [Tag_v2.a_fait_travaux_recents],
      },
    });

    this.distribuerOuiNon(
      this.is_code(KYCID.KYC_consommation_relation_objets, 'maximum'),
      {
        oui: {
          set: [Tag_v2.prend_soin_objets],
        },
        non: {
          rm: [Tag_v2.prend_soin_objets],
        },
      },
    );

    this.distribuerOuiNon(
      this.has_one_of(KYCID.KYC_consommation_relation_objets, [
        'achete_jamais',
        'seconde_main',
      ]),
      {
        oui: {
          set: [Tag_v2.achete_peu_et_occasion],
        },
        non: {
          rm: [Tag_v2.achete_peu_et_occasion],
        },
      },
    );
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
  private is_code(kyc_code: string, code: string): boolean {
    const kyc = this.hist.getQuestionChoix(kyc_code);
    if (!kyc) return false;
    return kyc.isSelected(code);
  }

  private distribuerOuiNonAutre(kyc_code: KYCID, tags: oui_non_autre) {
    const kyc = this.hist.getQuestionChoixUnique(kyc_code);
    if (!kyc) return;

    if (kyc.isSelected(BooleanKYC.oui)) {
      this.setTags(tags.oui.set);
      this.removeTags(tags.oui.rm);
    } else if (kyc.isSelected(BooleanKYC.non)) {
      this.setTags(tags.non.set);
      this.removeTags(tags.non.rm);
    } else {
      this.setTags(tags.autre.set);
      this.removeTags(tags.autre.rm);
    }
  }
  private distribuerOuiNon(oui: boolean, tags: oui_non) {
    if (oui) {
      this.setTags(tags.oui.set);
      this.removeTags(tags.oui.rm);
    } else {
      this.setTags(tags.non.set);
      this.removeTags(tags.non.rm);
    }
  }
  private distribuerChoixMultiple(kyc_code: KYCID, mapping: code_tag) {
    const kyc = this.hist.getQuestionChoixMultiple(kyc_code);
    if (!kyc) return;
    for (const [code, tag] of Object.entries(mapping)) {
      if (kyc.isSelected(code)) {
        this.profile.setTag(tag);
      } else {
        this.profile.removeTag(tag);
      }
    }
  }

  private setTags(tags: Tag_v2[]) {
    if (tags) {
      for (const tag of tags) {
        this.profile.setTag(tag);
      }
    }
  }
  private removeTags(tags: Tag_v2[]) {
    if (tags) {
      for (const tag of tags) {
        this.profile.removeTag(tag);
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
