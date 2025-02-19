import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
import instructionsDeMigration from '@incubateur-ademe/nosgestesclimat/public/migration.json';
import { Injectable } from '@nestjs/common';
import Engine, { Evaluation } from 'publicodes';

import {
  BilanCarbone,
  DetailImpact,
  ImpactThematique,
  NB_SEMAINES_PAR_ANNEE,
  RegleNGC,
  SituationNGC,
} from '../../domain/bilan/bilanCarbone';
import { Bilan_OLD } from '../../domain/bilan/bilan_old';
import { Thematique } from '../../domain/contenu/thematique';

const { migrateSituation } = require('@publicodes/tools/migration');

@Injectable()
export class NGCCalculator {
  private engine: Engine;

  constructor() {
    this.engine = NGCCalculator.createNewNGCPublicodesEngine();
  }

  static createNewNGCPublicodesEngine(): Engine {
    const nbRules = Object.keys(rules).length;
    console.time(`Parsing ${nbRules} rules`);
    const engine = new Engine(rules, {
      strict: { noOrphanRule: false },
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

  computeBilanCarboneFromSituation(situation: SituationNGC): BilanCarbone {
    const entryList: RegleNGC[] = [
      'bilan',
      'transport',
      'transport . voiture',
      'transport . avion',
      'transport . deux roues',
      'transport . mobilité douce',
      'transport . transports commun',
      'transport . train',
      'transport . vacances',
      'transport . ferry',
      'logement',
      'logement . construction',
      'logement . électricité',
      'logement . chauffage',
      'logement . climatisation',
      'logement . piscine',
      'logement . extérieur',
      'logement . vacances',
      'divers',
      'divers . animaux domestiques',
      'divers . textile',
      'divers . électroménager',
      'divers . ameublement',
      'divers . numérique',
      'divers . loisirs',
      'divers . autres produits',
      'divers . tabac',
      'alimentation',
      'alimentation . petit déjeuner annuel',
      'alimentation . plats . viande rouge',
      'alimentation . plats . viande blanche',
      'alimentation . plats . poisson gras',
      'alimentation . plats . poisson blanc',
      'alimentation . plats . végétarien',
      'alimentation . plats . végétalien',
      'alimentation . boisson',
      'services sociétaux',
      'services sociétaux . services publics',
      'services sociétaux . services marchands',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    const getValueOf = (key: RegleNGC) =>
      getValueFromMap<RegleNGC>(resultMap, key);

    const total = getValueOf('bilan');

    const transport = getValueOf('transport');
    const transport_voiture = getValueOf('transport . voiture');
    const transport_avion = getValueOf('transport . avion');
    const transport_2roues = getValueOf('transport . deux roues');
    const transport_mob_douce = getValueOf('transport . mobilité douce');
    const transport_commun = getValueOf('transport . transports commun');
    const transport_train = getValueOf('transport . train');
    const transport_vacances = getValueOf('transport . vacances');
    const transport_ferry = getValueOf('transport . ferry');

    const logement = getValueOf('logement');
    const logement_constr = getValueOf('logement . construction');
    const logement_elec = getValueOf('logement . électricité');
    const logement_chauf = getValueOf('logement . chauffage');
    const logement_clim = getValueOf('logement . climatisation');
    const logement_piscine = getValueOf('logement . piscine');
    const logement_ext = getValueOf('logement . extérieur');
    const logement_vacances = getValueOf('logement . vacances');

    const divers = getValueOf('divers');
    const divers_animaux = getValueOf('divers . animaux domestiques');
    const divers_textile = getValueOf('divers . textile');
    const divers_electro = getValueOf('divers . électroménager');
    const divers_ameublement = getValueOf('divers . ameublement');
    const divers_numérique = getValueOf('divers . numérique');
    const divers_loisirs = getValueOf('divers . loisirs');
    const divers_autres_produits = getValueOf('divers . autres produits');
    const divers_tabac = getValueOf('divers . tabac');

    const alimentation = getValueOf('alimentation');
    const alimentation_petit_dej = getValueOf(
      'alimentation . petit déjeuner annuel',
    );

    const alimentation_viande_par_semaine =
      getValueOf('alimentation . plats . viande rouge') +
      getValueOf('alimentation . plats . viande blanche');
    const alimentation_viande =
      alimentation_viande_par_semaine * NB_SEMAINES_PAR_ANNEE;

    const alimentation_poisson_par_semaine =
      getValueOf('alimentation . plats . poisson gras') +
      getValueOf('alimentation . plats . poisson blanc');
    const alimentation_poisson =
      alimentation_poisson_par_semaine * NB_SEMAINES_PAR_ANNEE;

    const alimentation_fruits_legumes_par_semaine =
      getValueOf('alimentation . plats . végétarien') +
      getValueOf('alimentation . plats . végétalien');
    const alimentation_fruits_legumes =
      alimentation_fruits_legumes_par_semaine * NB_SEMAINES_PAR_ANNEE;

    const alimentation_boisson = getValueOf('alimentation . boisson');

    const services_societaux = getValueOf('services sociétaux');
    const services_societaux_pub = getValueOf(
      'services sociétaux . services publics',
    );
    const services_societaux_march = getValueOf(
      'services sociétaux . services marchands',
    );

    const impacts: ImpactThematique[] = [];
    impacts.push({
      pourcentage: roundedPercentOf(transport, total),
      thematique: Thematique.transport,
      impact_kg_annee: transport,
      emoji: '🚦',
      details: [
        {
          label: 'Voiture',
          pourcentage: roundedPercentOf(transport_voiture, total),
          pourcentage_categorie: roundedPercentOf(transport_voiture, transport),
          impact_kg_annee: transport_voiture,
          emoji: '🚘️',
        },
        {
          label: 'Avion',
          pourcentage: roundedPercentOf(transport_avion, total),
          pourcentage_categorie: Math.round(
            (transport_avion / transport) * 100,
          ),
          impact_kg_annee: transport_avion,
          emoji: '✈️',
        },
        {
          label: '2 roues',
          pourcentage: roundedPercentOf(transport_2roues, total),
          pourcentage_categorie: roundedPercentOf(transport_2roues, transport),
          impact_kg_annee: transport_2roues,
          emoji: '🛵',
        },
        {
          label: 'Mobilité douce',
          pourcentage: roundedPercentOf(transport_mob_douce, total),
          pourcentage_categorie: roundedPercentOf(
            transport_mob_douce,
            transport,
          ),
          impact_kg_annee: transport_mob_douce,
          emoji: '🚲',
        },
        {
          label: 'Transports en commun',
          pourcentage: roundedPercentOf(transport_commun, total),
          pourcentage_categorie: roundedPercentOf(transport_commun, transport),
          impact_kg_annee: transport_commun,
          emoji: '🚌',
        },
        {
          label: 'Train',
          pourcentage: roundedPercentOf(transport_train, total),
          pourcentage_categorie: roundedPercentOf(transport_train, transport),
          impact_kg_annee: transport_train,
          emoji: '🚋',
        },
        {
          label: 'Vacances',
          pourcentage: roundedPercentOf(transport_vacances, total),
          pourcentage_categorie: roundedPercentOf(
            transport_vacances,
            transport,
          ),
          impact_kg_annee: transport_vacances,
          emoji: '🏖️',
        },
        {
          label: 'Ferry',
          pourcentage: roundedPercentOf(transport_ferry, total),
          pourcentage_categorie: roundedPercentOf(transport_ferry, transport),
          impact_kg_annee: transport_ferry,
          emoji: '⛴',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(logement, total),
      thematique: Thematique.logement,
      impact_kg_annee: logement,
      emoji: '🏠',
      details: [
        {
          label: 'Construction',
          pourcentage: roundedPercentOf(logement_constr, total),
          pourcentage_categorie: roundedPercentOf(logement_constr, logement),
          impact_kg_annee: logement_constr,
          emoji: '🧱',
        },
        {
          label: 'Electricité',
          pourcentage: roundedPercentOf(logement_elec, total),
          pourcentage_categorie: roundedPercentOf(logement_elec, logement),
          impact_kg_annee: logement_elec,
          emoji: '⚡',
        },
        {
          label: 'Chauffage',
          pourcentage: roundedPercentOf(logement_chauf, total),
          pourcentage_categorie: roundedPercentOf(logement_chauf, logement),
          impact_kg_annee: logement_chauf,
          emoji: '🔥',
        },
        {
          label: 'Climatisation',
          pourcentage: roundedPercentOf(logement_clim, total),
          pourcentage_categorie: roundedPercentOf(logement_clim, logement),
          impact_kg_annee: logement_clim,
          emoji: '❄️',
        },
        {
          label: 'Piscine',
          pourcentage: roundedPercentOf(logement_piscine, total),
          pourcentage_categorie: roundedPercentOf(logement_piscine, logement),
          impact_kg_annee: logement_piscine,
          emoji: '🏊',
        },
        {
          label: 'Extérieur',
          pourcentage: roundedPercentOf(logement_ext, total),
          pourcentage_categorie: roundedPercentOf(logement_ext, logement),
          impact_kg_annee: logement_ext,
          emoji: '☘️',
        },
        {
          label: 'Vacances',
          pourcentage: roundedPercentOf(logement_vacances, total),
          pourcentage_categorie: roundedPercentOf(logement_vacances, logement),
          impact_kg_annee: logement_vacances,
          emoji: '🏖',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(divers, total),
      thematique: Thematique.consommation,
      impact_kg_annee: divers,
      emoji: '📦',
      details: [
        {
          label: 'Animaux',
          pourcentage: roundedPercentOf(divers_animaux, total),
          pourcentage_categorie: roundedPercentOf(divers_animaux, divers),
          impact_kg_annee: divers_animaux,
          emoji: '🐶',
        },
        {
          label: 'Electroménager',
          pourcentage: roundedPercentOf(divers_electro, total),
          pourcentage_categorie: roundedPercentOf(divers_electro, divers),
          impact_kg_annee: divers_electro,
          emoji: '🔌',
        },
        {
          label: 'Ameublement',
          pourcentage: roundedPercentOf(divers_ameublement, total),
          pourcentage_categorie: roundedPercentOf(divers_ameublement, divers),
          impact_kg_annee: divers_ameublement,
          emoji: '🛋️',
        },
        {
          label: 'Numérique',
          pourcentage: roundedPercentOf(divers_numérique, total),
          pourcentage_categorie: roundedPercentOf(divers_numérique, divers),
          impact_kg_annee: divers_numérique,
          emoji: '📺',
        },
        {
          label: 'Loisirs',
          pourcentage: roundedPercentOf(divers_loisirs, total),
          pourcentage_categorie: roundedPercentOf(divers_loisirs, divers),
          impact_kg_annee: divers_loisirs,
          emoji: '🎭',
        },
        {
          label: 'Autres produits',
          pourcentage: roundedPercentOf(divers_autres_produits, total),
          pourcentage_categorie: roundedPercentOf(
            divers_autres_produits,
            divers,
          ),
          impact_kg_annee: divers_autres_produits,
          emoji: '📦',
        },
        {
          label: 'Tabac',
          pourcentage: roundedPercentOf(divers_tabac, total),
          pourcentage_categorie: roundedPercentOf(divers_tabac, divers),
          impact_kg_annee: divers_tabac,
          emoji: '🚬',
        },
        {
          label: 'Textile',
          pourcentage: roundedPercentOf(divers_textile, total),
          pourcentage_categorie: roundedPercentOf(divers_textile, divers),
          impact_kg_annee: divers_textile,
          emoji: '👕',
        },
      ],
    });
    impacts.push({
      pourcentage: roundedPercentOf(alimentation, total),
      thematique: Thematique.alimentation,
      impact_kg_annee: alimentation,
      emoji: '🍴',
      details: [
        {
          label: 'Petit déjeuner',
          pourcentage: roundedPercentOf(alimentation_petit_dej, total),
          pourcentage_categorie: roundedPercentOf(
            alimentation_petit_dej,
            alimentation,
          ),
          impact_kg_annee: alimentation_petit_dej,
          emoji: '🥐',
        },
        {
          label: 'Viandes',
          pourcentage: roundedPercentOf(alimentation_viande, total),
          pourcentage_categorie: roundedPercentOf(
            alimentation_viande,
            alimentation,
          ),
          impact_kg_annee: alimentation_viande,
          emoji: '🥩',
        },
        {
          label: 'Poissons',
          pourcentage: roundedPercentOf(alimentation_poisson, total),
          pourcentage_categorie: roundedPercentOf(
            alimentation_poisson,
            alimentation,
          ),
          impact_kg_annee: alimentation_poisson,
          emoji: '🐟',
        },
        {
          label: 'Fruits & Légumes',
          pourcentage: roundedPercentOf(alimentation_fruits_legumes, total),
          pourcentage_categorie: roundedPercentOf(
            alimentation_fruits_legumes,
            alimentation,
          ),
          impact_kg_annee: alimentation_fruits_legumes,
          emoji: '🥦',
        },
        {
          label: 'Boissons',
          pourcentage: roundedPercentOf(alimentation_boisson, total),
          pourcentage_categorie: roundedPercentOf(
            alimentation_boisson,
            alimentation,
          ),
          impact_kg_annee: alimentation_boisson,
          emoji: '🥤',
        },
      ],
    });

    impacts.push({
      pourcentage: roundedPercentOf(services_societaux, total),
      thematique: Thematique.services_societaux,
      impact_kg_annee: services_societaux,
      emoji: '🏛️',
      details: [
        {
          label: 'Services publics',
          pourcentage: roundedPercentOf(services_societaux_pub, total),
          pourcentage_categorie: roundedPercentOf(
            services_societaux_pub,
            services_societaux,
          ),
          impact_kg_annee: services_societaux_pub,
          emoji: '🏛',
        },
        {
          label: 'Services marchands',
          pourcentage: roundedPercentOf(services_societaux_march, total),
          pourcentage_categorie: roundedPercentOf(
            services_societaux_march,
            services_societaux,
          ),
          impact_kg_annee: services_societaux_march,
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

  computeBilanFromSituation(situation: SituationNGC): Bilan_OLD {
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

function computeTop3Details(liste_impacts: ImpactThematique[]): DetailImpact[] {
  let liste_details: DetailImpact[] = [];
  for (const cat of liste_impacts) {
    liste_details = liste_details.concat(cat.details);
  }
  liste_details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
  return liste_details.slice(0, 3);
}
