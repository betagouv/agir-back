import { RegleNGC } from '../bilan/bilanCarbone';
import { RegleSimulateurVoiture } from '../simulateur_voiture/parametres';
import { KYCID } from './KYCID';
import { BooleanKYC } from './QuestionKYCData';

/**
 * Associates KYC IDs with their corresponding values.
 *
 * @note This is a partial type as it's completed by hand when needed.
 *
 * TODO: use a generated NGCRuleValues type to type check the ngc_code values.
 * TODO: we may want to distinguish between the ngc_code and other values.
 */
export type KYCComplexValues = {
  [key in KYCID]: { code: string; ngc_code?: string };
} & {
  _default: { code: string; ngc_code?: string };
  [KYCID.KYC009]: {
    code: 'ma_voit' | 'loc_voit' | 'co_voit' | 'pas_voiture';
    ngc_code: undefined;
  };
  [KYCID.KYC_transport_type_utilisateur]:
    | { code: 'proprio'; ngc_code: "'propriétaire'" }
    | { code: 'pas_la_mienne'; ngc_code: "'régulier non propriétaire'" }
    | { code: 'change_souvent'; ngc_code: "'non régulier'" }
    | { code: 'jamais'; ngc_code: "'jamais'" };
  [KYCID.KYC_transport_voiture_gabarit]:
    | { code: 'petite'; ngc_code: "'petite'" }
    | { code: 'moyenne'; ngc_code: "'moyenne'" }
    | { code: 'berline'; ngc_code: "'berline'" }
    | { code: 'SUV'; ngc_code: "'SUV'" }
    | { code: 'VUL'; ngc_code: "'VUL'" };
  [KYCID.KYC_transport_voiture_motorisation]:
    | { code: 'thermique'; ngc_code: "'thermique'" }
    | { code: 'hybride_rechargeable'; ngc_code: "'hybride rechargeable'" }
    | {
        code: 'hybride_non_rechargeable';
        ngc_code: "'hybride non rechargeable'";
      }
    | { code: 'electrique'; ngc_code: "'électrique'" };
  [KYCID.KYC_transport_voiture_thermique_carburant]:
    | { code: 'gazole_B7_B10'; ngc_code: "'gazole B7 ou B10'" }
    | { code: 'essence_E5_E10'; ngc_code: "'essence E5 ou E10'" }
    | { code: 'essence_E85'; ngc_code: "'essence E85'" }
    | { code: 'GPL'; ngc_code: "'GPL'" };
  [KYCID.KYC_transport_voiture_occasion]:
    | { code: 'oui'; ngc_code: 'oui' }
    | { code: 'non'; ngc_code: 'non' };
  [KYCID.KYC_consommation_relation_objets]:
    | { code: 'faible'; ngc_code: "'faible'" }
    | { code: 'moyen'; ngc_code: "'moyen'" }
    | { code: 'maximum'; ngc_code: "'maximum'" };
  [KYCID.KYC_local_frequence]:
    | { code: 'jamais'; ngc_code: "'jamais'" }
    | { code: 'parfois'; ngc_code: "'parfois'" }
    | { code: 'souvent'; ngc_code: "'souvent'" }
    | { code: 'toujours'; ngc_code: "'oui toujours'" };
  [KYCID.KYC_possede_voiture_oui_non]:
    | { code: BooleanKYC.oui; ngc_code: 'oui' }
    | { code: BooleanKYC.non; ngc_code: 'non' };
};

// NOTE: sûrement à déplacer dans un fichier dédié
export type PublicodesModels = 'nosgestesclimat' | 'simulateur-voiture'; // | 'aides-velo'

export type PublicodesModelsRules = {
  nosgestesclimat: RegleNGC;
  'simulateur-voiture': RegleSimulateurVoiture;
};

type KYCIDToRegleMapping = {
  [K in KYCID]: Partial<{
    [M in PublicodesModels]: M extends keyof PublicodesModelsRules
      ? PublicodesModelsRules[M]
      : never;
  }>;
};

/**
 * Associe à chaque KYC le nom de la règle correspondante dans chaque modèle Publicodes
 * dans lequel elle est utilisée.
 */
export const KYCS_TO_RULE_NAME: Partial<KYCIDToRegleMapping> = {
  KYC_transport_type_utilisateur: {
    nosgestesclimat: 'transport . voiture . utilisateur',
  },
  KYC_transport_voiture_occasion: {
    'simulateur-voiture': 'voiture . occasion',
  },
  KYC_transport_voiture_gabarit: {
    nosgestesclimat: 'transport . voiture . gabarit',
    'simulateur-voiture': 'voiture . gabarit',
  },
  KYC_transport_voiture_duree_detention: {
    'simulateur-voiture': 'voiture . durée de détention totale',
  },
  KYC_transport_voiture_annee_fabrication: {
    'simulateur-voiture': 'voiture . année de fabrication',
  },
  KYC_transport_voiture_prix_achat: {
    'simulateur-voiture': "voiture . prix d'achat",
  },
  KYC_transport_voiture_motorisation: {
    nosgestesclimat: 'transport . voiture . motorisation',
    'simulateur-voiture': 'voiture . motorisation',
  },
  KYC_transport_voiture_thermique_carburant: {
    nosgestesclimat: 'transport . voiture . thermique . carburant',
    'simulateur-voiture': 'voiture . thermique . carburant',
  },
  KYC_transport_voiture_thermique_consomation_carburant: {
    nosgestesclimat: 'transport . voiture . thermique . consommation aux 100',
    'simulateur-voiture': 'voiture . thermique . consommation carburant',
  },
  KYC_transport_voiture_thermique_prix_carburant: {
    'simulateur-voiture': 'voiture . thermique . prix carburant',
  },
  KYC_transport_voiture_electrique_consommation: {
    nosgestesclimat: 'transport . voiture . électrique . consommation aux 100',
    'simulateur-voiture': 'voiture . électrique . consommation électricité',
  },
  KYC_transport_voiture_electrique_prix_kwh: {
    'simulateur-voiture': 'voiture . électrique . prix kWh',
  },
  KYC_transport_voiture_couts_entretien: {
    'simulateur-voiture': 'coûts . coûts de possession . entretien',
  },
  KYC_transport_voiture_couts_assurance: {
    'simulateur-voiture': 'coûts . coûts de possession . assurance',
  },
  KYC_transport_voiture_km: {
    nosgestesclimat: 'transport . voiture . km',
    'simulateur-voiture': 'usage . km annuels . renseignés',
  },
  KYC_transport_voiture_couts_stationnement: {
    'simulateur-voiture': "coûts . coûts d'utilisation . stationnement",
  },
  KYC_transport_voiture_couts_peage: {
    'simulateur-voiture': "coûts . coûts d'utilisation . péage",
  },
};
