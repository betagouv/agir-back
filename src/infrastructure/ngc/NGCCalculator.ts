import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr-opti.json';
import instructionsDeMigration from '@incubateur-ademe/nosgestesclimat/public/migration.json';
import { Injectable } from '@nestjs/common';
import Engine, { Evaluation } from 'publicodes';

import {
  BilanCarbone,
  DetailImpact,
  ImpactThematique,
  ImpactThematiqueStandalone,
  NB_SEMAINES_PAR_ANNEE,
  RegleNGC,
  SituationNGC,
} from '../../domain/bilan/bilanCarbone';
import { Bilan_OLD } from '../../domain/bilan/bilan_old';
import { Thematique } from '../../domain/thematique/thematique';
import { ApplicationError } from '../applicationError';

const { migrateSituation } = require('@publicodes/tools/migration');

const regles_transport: RegleNGC[] = [
  'transport',
  'transport . voiture',
  'transport . avion',
  'transport . deux roues',
  'transport . mobilité douce',
  'transport . transports commun',
  'transport . train',
  'transport . vacances',
  'transport . ferry',
];
const regles_logement: RegleNGC[] = [
  'logement',
  'logement . construction',
  'logement . électricité',
  'logement . chauffage',
  'logement . climatisation',
  'logement . piscine',
  'logement . extérieur',
  'logement . vacances',
];
const regles_alimentation: RegleNGC[] = [
  'alimentation',
  'alimentation . petit déjeuner annuel',
  'alimentation . plats . viande rouge',
  'alimentation . plats . viande blanche',
  'alimentation . plats . poisson gras',
  'alimentation . plats . poisson blanc',
  'alimentation . plats . végétarien',
  'alimentation . plats . végétalien',
  'alimentation . boisson',
];
const regles_consommation: RegleNGC[] = [
  'divers',
  'divers . animaux domestiques',
  'divers . textile',
  'divers . électroménager',
  'divers . ameublement',
  'divers . numérique',
  'divers . loisirs',
  'divers . autres produits',
  'divers . tabac',
];
const regles_services_societaux: RegleNGC[] = [
  'services sociétaux',
  'services sociétaux . services publics',
  'services sociétaux . services marchands',
];
const REGLES_NGC: { [key in Thematique]?: RegleNGC[] } = {
  alimentation: regles_alimentation,
  consommation: regles_consommation,
  logement: regles_logement,
  transport: regles_transport,
  services_societaux: regles_services_societaux,
};

export type ValeursAlimentation = {
  alimentation: number;
  alimentation_petit_dej: number;
  alimentation_viande_par_semaine: number;
  alimentation_viande: number;
  alimentation_poisson_par_semaine: number;
  alimentation_poisson: number;
  alimentation_fruits_legumes_par_semaine: number;
  alimentation_fruits_legumes: number;
  alimentation_boisson: number;
};
export type ValeursTransport = {
  transport: number;
  transport_voiture: number;
  transport_avion: number;
  transport_2roues: number;
  transport_mob_douce: number;
  transport_commun: number;
  transport_train: number;
  transport_vacances: number;
  transport_ferry: number;
};
export type ValeursLogement = {
  logement: number;
  logement_constr: number;
  logement_elec: number;
  logement_chauf: number;
  logement_clim: number;
  logement_piscine: number;
  logement_ext: number;
  logement_vacances: number;
};
export type ValeursConsommation = {
  divers: number;
  divers_animaux: number;
  divers_textile: number;
  divers_electro: number;
  divers_ameublement: number;
  divers_numérique: number;
  divers_loisirs: number;
  divers_autres_produits: number;
  divers_tabac: number;
};
export type ValeursServicesSocietaux = {
  services_societaux: number;
  services_societaux_pub: number;
  services_societaux_march: number;
};

@Injectable()
export class NGCCalculator {
  private engine: Engine;

  public static DEFAULT_TOTAL_KG = 8792.165289982346;
  public static DEFAULT_ALIMENTATION_KG = 2043.6891821;
  public static DEFAULT_TRANSPORT_KG = 2075.4519241191;
  public static DEFAULT_CONSOMMATION_KG = 1055.7018191109457;
  public static DEFAULT_LOGEMENT_KG = 2166.417138265936;

  public static DEFAULT_TOTAL_KG_ROUND = Math.floor(
    NGCCalculator.DEFAULT_TOTAL_KG,
  );
  public static DEFAULT_ALIMENTATION_KG_ROUND = Math.floor(
    NGCCalculator.DEFAULT_ALIMENTATION_KG,
  );
  public static DEFAULT_TRANSPORT_KG_ROUND = Math.floor(
    NGCCalculator.DEFAULT_TRANSPORT_KG,
  );
  public static DEFAULT_CONSOMMATION_KG_ROUND = Math.floor(
    NGCCalculator.DEFAULT_CONSOMMATION_KG,
  );
  public static DEFAULT_LOGEMENT_KG_ROUND = Math.floor(
    NGCCalculator.DEFAULT_LOGEMENT_KG,
  );

  constructor() {
    this.engine = NGCCalculator.createNewNGCPublicodesEngine();
  }

  static createNewNGCPublicodesEngine(): Engine {
    const nbRules = Object.keys(rules).length;
    console.time(`Parsing ${nbRules} rules`);
    const engine = new Engine(rules, {
      strict: {
        noOrphanRule: false,
        // Ignore unknown rule/values instead of throwing an error.
        // Needed until https://github.com/incubateur-ademe/nosgestesclimat/pull/2567 is published.
        situation: false,
      },
      logger: {
        log(_message: string) {},
        warn(_message: string) {},
        error(message: string) {
          console.error(message);
        },
      },
    });
    console.timeEnd(`Parsing ${nbRules} rules`);

    return engine;
  }

  /**
   * Plus d'explications sur la nécessité d'appeler cette fonction au lieu de
   * `engine.setSituation(situation)` directement dans la page de documentation
   * dédiée : ../../../docs/bilan-carbone-ngc.md.
   */
  static setSituationAvecMigration(
    engine: Engine,
    situation: SituationNGC,
  ): Engine {
    return engine.setSituation(
      migrateSituation(situation, instructionsDeMigration),
    );
  }

  computeSingleEntryValue(
    situation: SituationNGC,
    entry: RegleNGC,
  ): Evaluation {
    const local_engine = NGCCalculator.setSituationAvecMigration(
      this.engine.shallowCopy(),
      situation,
    );

    return local_engine.evaluate(entry).nodeValue;
  }

  computeEntryListValues(
    situation: SituationNGC,
    regles: RegleNGC[],
  ): Map<RegleNGC, Evaluation> {
    const local_engine = NGCCalculator.setSituationAvecMigration(
      this.engine.shallowCopy(),
      situation,
    );

    // NOTE: pourquoi utiliser une Map plutôt qu'un objet ? Les maps sont
    // particulièrement efficace pour les opérations de lectures/écritures, ce
    // qui ne semble pas être le cas ici.
    let result_map = new Map();

    for (const entry of regles) {
      result_map.set(entry, local_engine.evaluate(entry).nodeValue);
    }

    return result_map;
  }

  computeBilanCarboneThematiqueFromSituation(
    situation: SituationNGC,
    thematique: Thematique,
  ): ImpactThematiqueStandalone {
    if (!REGLES_NGC[thematique]) {
      ApplicationError.throwThematiqueForBilanNotAvailable(thematique);
    }

    let result: ImpactThematiqueStandalone;

    switch (thematique) {
      case Thematique.alimentation:
        result = this.formatBilanAlimentation(
          this.computeValeursAlimentation(situation),
        );
        break;
      case Thematique.transport:
        result = this.formatBilanTransport(
          this.computeValeursTransport(situation),
        );
        break;
      case Thematique.logement:
        result = this.formatBilanLogement(
          this.computeValeursLogement(situation),
        );
        break;
      case Thematique.consommation:
        result = this.formatBilanConsommation(
          this.computeValeursConsommation(situation),
        );
        break;
      case Thematique.services_societaux:
        result = this.formatBilanServiceSocietaux(
          this.computeValeursServiceSocietaux(situation),
        );
        break;
      default:
        break;
    }

    sortResultInPlaceImpactThematiqueStandalone(result);

    return result;
  }

  computeBilanCarboneFromSituation(situation: SituationNGC): BilanCarbone {
    const entryList = [].concat(
      'bilan',
      REGLES_NGC[Thematique.logement],
      REGLES_NGC[Thematique.alimentation],
      REGLES_NGC[Thematique.transport],
      REGLES_NGC[Thematique.consommation],
      REGLES_NGC[Thematique.services_societaux],
    );

    const full_computing = this.computeEntryListValues(situation, entryList);

    const total = this.extractTotal(full_computing);
    const val_trans = this.extractValeursTransport(full_computing);
    const val_log = this.extractValeursLogement(full_computing);
    const val_conso = this.extractValeursConsommation(full_computing);
    const val_alim = this.extractValeursAlimentation(full_computing);
    const val_soc = this.extractValeursServiceSocietaux(full_computing);

    const impacts: ImpactThematique[] = [];
    impacts.push({
      pourcentage: roundedPercentOf(val_trans.transport, total),
      thematique: Thematique.transport,
      impact_kg_annee: val_trans.transport,
      emoji: '🚦',
      details: [
        {
          label: 'Voiture',
          pourcentage: roundedPercentOf(val_trans.transport_voiture, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_voiture,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_voiture,
          emoji: '🚘️',
        },
        {
          label: 'Avion',
          pourcentage: roundedPercentOf(val_trans.transport_avion, total),
          pourcentage_categorie: Math.round(
            (val_trans.transport_avion / val_trans.transport) * 100,
          ),
          impact_kg_annee: val_trans.transport_avion,
          emoji: '✈️',
        },
        {
          label: '2 roues',
          pourcentage: roundedPercentOf(val_trans.transport_2roues, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_2roues,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_2roues,
          emoji: '🛵',
        },
        {
          label: 'Mobilité douce',
          pourcentage: roundedPercentOf(val_trans.transport_mob_douce, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_mob_douce,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_mob_douce,
          emoji: '🚲',
        },
        {
          label: 'Transports en commun',
          pourcentage: roundedPercentOf(val_trans.transport_commun, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_commun,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_commun,
          emoji: '🚌',
        },
        {
          label: 'Train',
          pourcentage: roundedPercentOf(val_trans.transport_train, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_train,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_train,
          emoji: '🚋',
        },
        {
          label: 'Vacances',
          pourcentage: roundedPercentOf(val_trans.transport_vacances, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_vacances,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_vacances,
          emoji: '🏖️',
        },
        {
          label: 'Ferry',
          pourcentage: roundedPercentOf(val_trans.transport_ferry, total),
          pourcentage_categorie: roundedPercentOf(
            val_trans.transport_ferry,
            val_trans.transport,
          ),
          impact_kg_annee: val_trans.transport_ferry,
          emoji: '⛴',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(val_log.logement, total),
      thematique: Thematique.logement,
      impact_kg_annee: val_log.logement,
      emoji: '🏠',
      details: [
        {
          label: 'Construction',
          pourcentage: roundedPercentOf(val_log.logement_constr, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_constr,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_constr,
          emoji: '🧱',
        },
        {
          label: 'Electricité',
          pourcentage: roundedPercentOf(val_log.logement_elec, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_elec,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_elec,
          emoji: '⚡',
        },
        {
          label: 'Chauffage',
          pourcentage: roundedPercentOf(val_log.logement_chauf, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_chauf,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_chauf,
          emoji: '🔥',
        },
        {
          label: 'Climatisation',
          pourcentage: roundedPercentOf(val_log.logement_clim, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_clim,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_clim,
          emoji: '❄️',
        },
        {
          label: 'Piscine',
          pourcentage: roundedPercentOf(val_log.logement_piscine, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_piscine,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_piscine,
          emoji: '🏊',
        },
        {
          label: 'Extérieur',
          pourcentage: roundedPercentOf(val_log.logement_ext, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_ext,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_ext,
          emoji: '☘️',
        },
        {
          label: 'Vacances',
          pourcentage: roundedPercentOf(val_log.logement_vacances, total),
          pourcentage_categorie: roundedPercentOf(
            val_log.logement_vacances,
            val_log.logement,
          ),
          impact_kg_annee: val_log.logement_vacances,
          emoji: '🏖',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(val_conso.divers, total),
      thematique: Thematique.consommation,
      impact_kg_annee: val_conso.divers,
      emoji: '📦',
      details: [
        {
          label: 'Animaux',
          pourcentage: roundedPercentOf(val_conso.divers_animaux, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_animaux,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_animaux,
          emoji: '🐶',
        },
        {
          label: 'Electroménager',
          pourcentage: roundedPercentOf(val_conso.divers_electro, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_electro,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_electro,
          emoji: '🔌',
        },
        {
          label: 'Ameublement',
          pourcentage: roundedPercentOf(val_conso.divers_ameublement, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_ameublement,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_ameublement,
          emoji: '🛋️',
        },
        {
          label: 'Numérique',
          pourcentage: roundedPercentOf(val_conso.divers_numérique, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_numérique,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_numérique,
          emoji: '📺',
        },
        {
          label: 'Loisirs',
          pourcentage: roundedPercentOf(val_conso.divers_loisirs, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_loisirs,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_loisirs,
          emoji: '🎭',
        },
        {
          label: 'Autres produits',
          pourcentage: roundedPercentOf(
            val_conso.divers_autres_produits,
            total,
          ),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_autres_produits,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_autres_produits,
          emoji: '📦',
        },
        {
          label: 'Tabac',
          pourcentage: roundedPercentOf(val_conso.divers_tabac, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_tabac,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_tabac,
          emoji: '🚬',
        },
        {
          label: 'Textile',
          pourcentage: roundedPercentOf(val_conso.divers_textile, total),
          pourcentage_categorie: roundedPercentOf(
            val_conso.divers_textile,
            val_conso.divers,
          ),
          impact_kg_annee: val_conso.divers_textile,
          emoji: '👕',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(val_alim.alimentation, total),
      thematique: Thematique.alimentation,
      impact_kg_annee: val_alim.alimentation,
      emoji: '🍴',
      details: [
        {
          label: 'Petit déjeuner',
          pourcentage: roundedPercentOf(val_alim.alimentation_petit_dej, total),
          pourcentage_categorie: roundedPercentOf(
            val_alim.alimentation_petit_dej,
            val_alim.alimentation,
          ),
          impact_kg_annee: val_alim.alimentation_petit_dej,
          emoji: '🥐',
        },
        {
          label: 'Viandes',
          pourcentage: roundedPercentOf(val_alim.alimentation_viande, total),
          pourcentage_categorie: roundedPercentOf(
            val_alim.alimentation_viande,
            val_alim.alimentation,
          ),
          impact_kg_annee: val_alim.alimentation_viande,
          emoji: '🥩',
        },
        {
          label: 'Poissons',
          pourcentage: roundedPercentOf(val_alim.alimentation_poisson, total),
          pourcentage_categorie: roundedPercentOf(
            val_alim.alimentation_poisson,
            val_alim.alimentation,
          ),
          impact_kg_annee: val_alim.alimentation_poisson,
          emoji: '🐟',
        },
        {
          label: 'Fruits & Légumes',
          pourcentage: roundedPercentOf(
            val_alim.alimentation_fruits_legumes,
            total,
          ),
          pourcentage_categorie: roundedPercentOf(
            val_alim.alimentation_fruits_legumes,
            val_alim.alimentation,
          ),
          impact_kg_annee: val_alim.alimentation_fruits_legumes,
          emoji: '🥦',
        },
        {
          label: 'Boissons',
          pourcentage: roundedPercentOf(val_alim.alimentation_boisson, total),
          pourcentage_categorie: roundedPercentOf(
            val_alim.alimentation_boisson,
            val_alim.alimentation,
          ),
          impact_kg_annee: val_alim.alimentation_boisson,
          emoji: '🥤',
        },
      ],
    });

    impacts.push({
      pourcentage: roundedPercentOf(val_soc.services_societaux, total),
      thematique: Thematique.services_societaux,
      impact_kg_annee: val_soc.services_societaux,
      emoji: '🏛️',
      details: [
        {
          label: 'Services publics',
          pourcentage: roundedPercentOf(val_soc.services_societaux_pub, total),
          pourcentage_categorie: roundedPercentOf(
            val_soc.services_societaux_pub,
            val_soc.services_societaux,
          ),
          impact_kg_annee: val_soc.services_societaux_pub,
          emoji: '🏛',
        },
        {
          label: 'Services marchands',
          pourcentage: roundedPercentOf(
            val_soc.services_societaux_march,
            total,
          ),
          pourcentage_categorie: roundedPercentOf(
            val_soc.services_societaux_march,
            val_soc.services_societaux,
          ),
          impact_kg_annee: val_soc.services_societaux_march,
          emoji: '✉️',
        },
      ],
    });

    sortResultInPlace(impacts);

    const top_3 = computeTop3Details(impacts);

    return new BilanCarbone({
      impact_kg_annee: total,
      impact_thematique: impacts,
      top_3: top_3,
    });
  }

  computeBasicBilanFromSituation(situation: SituationNGC): Bilan_OLD {
    const entryList: RegleNGC[] = [
      'bilan',
      'transport',
      'logement',
      'divers',
      'alimentation',
      'services sociétaux',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    return {
      bilan_carbone_annuel: getValueFromMap(resultMap, 'bilan'),
      details: {
        transport: getValueFromMap(resultMap, 'transport'),
        logement: getValueFromMap(resultMap, 'logement'),
        divers: getValueFromMap(resultMap, 'divers'),
        alimentation: getValueFromMap(resultMap, 'alimentation'),
        services_societaux: getValueFromMap(resultMap, 'services sociétaux'),
      },
    };
  }

  private formatBilanAlimentation(
    bilan: ValeursAlimentation,
  ): ImpactThematiqueStandalone {
    return {
      thematique: Thematique.alimentation,
      impact_kg_annee: bilan.alimentation,
      emoji: '🍴',
      details: [
        {
          label: 'Petit déjeuner',
          impact_kg_annee: bilan.alimentation_petit_dej,
          emoji: '🥐',
        },
        {
          label: 'Viandes',
          impact_kg_annee: bilan.alimentation_viande,
          emoji: '🥩',
        },
        {
          label: 'Poissons',
          impact_kg_annee: bilan.alimentation_poisson,
          emoji: '🐟',
        },
        {
          label: 'Fruits & Légumes',
          impact_kg_annee: bilan.alimentation_fruits_legumes,
          emoji: '🥦',
        },
        {
          label: 'Boissons',
          impact_kg_annee: bilan.alimentation_boisson,
          emoji: '🥤',
        },
      ],
    };
  }

  private formatBilanTransport(
    bilan: ValeursTransport,
  ): ImpactThematiqueStandalone {
    return {
      thematique: Thematique.transport,
      impact_kg_annee: bilan.transport,
      emoji: '🚦',
      details: [
        {
          label: 'Voiture',
          impact_kg_annee: bilan.transport_voiture,
          emoji: '🚘️',
        },
        {
          label: 'Avion',
          impact_kg_annee: bilan.transport_avion,
          emoji: '✈️',
        },
        {
          label: '2 roues',
          impact_kg_annee: bilan.transport_2roues,
          emoji: '🛵',
        },
        {
          label: 'Mobilité douce',
          impact_kg_annee: bilan.transport_mob_douce,
          emoji: '🚲',
        },
        {
          label: 'Transports en commun',
          impact_kg_annee: bilan.transport_commun,
          emoji: '🚌',
        },
        {
          label: 'Train',
          impact_kg_annee: bilan.transport_train,
          emoji: '🚋',
        },
        {
          label: 'Vacances',
          impact_kg_annee: bilan.transport_vacances,
          emoji: '🏖️',
        },
        {
          label: 'Ferry',
          impact_kg_annee: bilan.transport_ferry,
          emoji: '⛴',
        },
      ],
    };
  }

  private formatBilanLogement(
    bilan: ValeursLogement,
  ): ImpactThematiqueStandalone {
    return {
      thematique: Thematique.logement,
      impact_kg_annee: bilan.logement,
      emoji: '🏠',
      details: [
        {
          label: 'Construction',
          impact_kg_annee: bilan.logement_constr,
          emoji: '🧱',
        },
        {
          label: 'Electricité',
          impact_kg_annee: bilan.logement_elec,
          emoji: '⚡',
        },
        {
          label: 'Chauffage',
          impact_kg_annee: bilan.logement_chauf,
          emoji: '🔥',
        },
        {
          label: 'Climatisation',
          impact_kg_annee: bilan.logement_clim,
          emoji: '❄️',
        },
        {
          label: 'Piscine',
          impact_kg_annee: bilan.logement_piscine,
          emoji: '🏊',
        },
        {
          label: 'Extérieur',
          impact_kg_annee: bilan.logement_ext,
          emoji: '☘️',
        },
        {
          label: 'Vacances',
          impact_kg_annee: bilan.logement_vacances,
          emoji: '🏖',
        },
      ],
    };
  }
  private formatBilanConsommation(
    bilan: ValeursConsommation,
  ): ImpactThematiqueStandalone {
    return {
      thematique: Thematique.consommation,
      impact_kg_annee: bilan.divers,
      emoji: '📦',
      details: [
        {
          label: 'Animaux',
          impact_kg_annee: bilan.divers_animaux,
          emoji: '🐶',
        },
        {
          label: 'Electroménager',
          impact_kg_annee: bilan.divers_electro,
          emoji: '🔌',
        },
        {
          label: 'Ameublement',
          impact_kg_annee: bilan.divers_ameublement,
          emoji: '🛋️',
        },
        {
          label: 'Numérique',
          impact_kg_annee: bilan.divers_numérique,
          emoji: '📺',
        },
        {
          label: 'Loisirs',
          impact_kg_annee: bilan.divers_loisirs,
          emoji: '🎭',
        },
        {
          label: 'Autres produits',
          impact_kg_annee: bilan.divers_autres_produits,
          emoji: '📦',
        },
        {
          label: 'Tabac',
          impact_kg_annee: bilan.divers_tabac,
          emoji: '🚬',
        },
        {
          label: 'Textile',
          impact_kg_annee: bilan.divers_textile,
          emoji: '👕',
        },
      ],
    };
  }

  private formatBilanServiceSocietaux(
    bilan: ValeursServicesSocietaux,
  ): ImpactThematiqueStandalone {
    return {
      thematique: Thematique.services_societaux,
      impact_kg_annee: bilan.services_societaux,
      emoji: '🏛️',
      details: [
        {
          label: 'Services publics',
          impact_kg_annee: bilan.services_societaux_pub,
          emoji: '🏛',
        },
        {
          label: 'Services marchands',
          impact_kg_annee: bilan.services_societaux_march,
          emoji: '✉️',
        },
      ],
    };
  }

  private computeValeursAlimentation(
    situation: SituationNGC,
  ): ValeursAlimentation {
    const entryList = REGLES_NGC[Thematique.alimentation];

    return this.extractValeursAlimentation(
      this.computeEntryListValues(situation, entryList),
    );
  }

  private extractValeursAlimentation(
    resultMap: Map<RegleNGC, Evaluation>,
  ): ValeursAlimentation {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    const viande_par_semaine =
      getValueOf('alimentation . plats . viande rouge') +
      getValueOf('alimentation . plats . viande blanche');

    const poisson_par_semaine =
      getValueOf('alimentation . plats . poisson gras') +
      getValueOf('alimentation . plats . poisson blanc');

    const fruits_legumes_par_semaine =
      getValueOf('alimentation . plats . végétarien') +
      getValueOf('alimentation . plats . végétalien');

    return {
      alimentation: getValueOf('alimentation'),
      alimentation_petit_dej: getValueOf(
        'alimentation . petit déjeuner annuel',
      ),
      alimentation_viande_par_semaine: viande_par_semaine,
      alimentation_viande: viande_par_semaine * NB_SEMAINES_PAR_ANNEE,
      alimentation_poisson_par_semaine: poisson_par_semaine,
      alimentation_poisson: poisson_par_semaine * NB_SEMAINES_PAR_ANNEE,
      alimentation_fruits_legumes_par_semaine: fruits_legumes_par_semaine,
      alimentation_fruits_legumes:
        fruits_legumes_par_semaine * NB_SEMAINES_PAR_ANNEE,
      alimentation_boisson: getValueOf('alimentation . boisson'),
    };
  }

  private computeValeursTransport(situation: SituationNGC): ValeursTransport {
    const entryList = REGLES_NGC[Thematique.transport];

    return this.extractValeursTransport(
      this.computeEntryListValues(situation, entryList),
    );
  }

  private extractValeursTransport(
    resultMap: Map<RegleNGC, Evaluation>,
  ): ValeursTransport {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return {
      transport: getValueOf('transport'),
      transport_voiture: getValueOf('transport . voiture'),
      transport_avion: getValueOf('transport . avion'),
      transport_2roues: getValueOf('transport . deux roues'),
      transport_mob_douce: getValueOf('transport . mobilité douce'),
      transport_commun: getValueOf('transport . transports commun'),
      transport_train: getValueOf('transport . train'),
      transport_vacances: getValueOf('transport . vacances'),
      transport_ferry: getValueOf('transport . ferry'),
    };
  }

  private computeValeurTotal(situation: SituationNGC): number {
    const entryList: RegleNGC[] = ['bilan'];

    const resultMap = this.computeEntryListValues(situation, entryList);

    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return getValueOf('bilan');
  }

  private computeValeursLogement(situation: SituationNGC): ValeursLogement {
    const entryList = REGLES_NGC[Thematique.logement];

    return this.extractValeursLogement(
      this.computeEntryListValues(situation, entryList),
    );
  }

  private extractValeursLogement(
    resultMap: Map<RegleNGC, Evaluation>,
  ): ValeursLogement {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return {
      logement: getValueOf('logement'),
      logement_constr: getValueOf('logement . construction'),
      logement_elec: getValueOf('logement . électricité'),
      logement_chauf: getValueOf('logement . chauffage'),
      logement_clim: getValueOf('logement . climatisation'),
      logement_piscine: getValueOf('logement . piscine'),
      logement_ext: getValueOf('logement . extérieur'),
      logement_vacances: getValueOf('logement . vacances'),
    };
  }
  private computeValeursConsommation(
    situation: SituationNGC,
  ): ValeursConsommation {
    const entryList = REGLES_NGC[Thematique.consommation];

    return this.extractValeursConsommation(
      this.computeEntryListValues(situation, entryList),
    );
  }

  private extractValeursConsommation(
    resultMap: Map<RegleNGC, Evaluation>,
  ): ValeursConsommation {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return {
      divers: getValueOf('divers'),
      divers_animaux: getValueOf('divers . animaux domestiques'),
      divers_textile: getValueOf('divers . textile'),
      divers_electro: getValueOf('divers . électroménager'),
      divers_ameublement: getValueOf('divers . ameublement'),
      divers_numérique: getValueOf('divers . numérique'),
      divers_loisirs: getValueOf('divers . loisirs'),
      divers_autres_produits: getValueOf('divers . autres produits'),
      divers_tabac: getValueOf('divers . tabac'),
    };
  }

  private computeValeursServiceSocietaux(
    situation: SituationNGC,
  ): ValeursServicesSocietaux {
    const entryList = REGLES_NGC[Thematique.services_societaux];

    return this.extractValeursServiceSocietaux(
      this.computeEntryListValues(situation, entryList),
    );
  }

  private extractValeursServiceSocietaux(
    resultMap: Map<RegleNGC, Evaluation>,
  ): ValeursServicesSocietaux {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return {
      services_societaux: getValueOf('services sociétaux'),
      services_societaux_pub: getValueOf(
        'services sociétaux . services publics',
      ),
      services_societaux_march: getValueOf(
        'services sociétaux . services marchands',
      ),
    };
  }
  private extractTotal(resultMap: Map<RegleNGC, Evaluation>): number {
    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    return getValueOf('bilan');
  }
}

function roundedPercentOf(value: number, total: number): number {
  return Math.round((value / total) * 100);
}

function getValueFromMap<K>(map: Map<K, any>, key: K): number {
  const result = map.get(key) as number;
  return result ? result : 0;
}

function sortResultInPlace(liste: ImpactThematique[]) {
  liste.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
  for (const thematique of liste) {
    thematique.details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
  }
}
function sortResultInPlaceImpactThematiqueStandalone(
  impact: ImpactThematiqueStandalone,
) {
  impact.details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
}

function computeTop3Details(liste_impacts: ImpactThematique[]): DetailImpact[] {
  let liste_details: DetailImpact[] = [];
  for (const cat of liste_impacts) {
    liste_details = liste_details.concat(cat.details);
  }
  liste_details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
  return liste_details.slice(0, 3);
}
