import { Injectable } from '@nestjs/common';
import { Bilan } from '../../domain/bilan/bilan';
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
import Engine, { ParsedRules, PublicodesError } from 'publicodes';
import {
  BilanCarbone,
  DetailImpact,
  ImpactUnivers,
} from '../../domain/bilan/bilanCarbone';
import { Univers } from '../../domain/univers/univers';

@Injectable()
export class NGCCalculator {
  private engine: Engine;

  constructor() {
    this.engine = new Engine(rules, {
      logger: {
        log(message: string) {},
        warn(message: string) {},
        error(message: string) {
          console.error(message);
        },
      },
    });
  }

  public listerToutesLesClésDeQuestions(prefix?: string): string[] {
    const result = [];

    const local_engine = this.engine.shallowCopy();

    const parsedRules = local_engine.getParsedRules();

    for (const key of Object.keys(parsedRules)) {
      if (
        parsedRules[key].rawNode.question !== undefined &&
        key.startsWith(prefix ? prefix : '')
      ) {
        result.push(key);
      }
    }
    return result;
  }

  public listeQuestionsAvecConditionApplicabilité() {
    const ressult = [];
    for (const key of Object.keys(rules)) {
      if (rules[key] && rules[key].question !== undefined) {
        if (rules[key]['non applicable si'] !== undefined) {
          ressult.push(key);
        }
      }
    }
    return ressult;
  }

  public estQuestionApplicable(situation: object, entry: string) {
    const local_engine = this.engine.shallowCopy();
    local_engine.setSituation(situation);

    const result = local_engine.evaluate({
      'est applicable': entry,
    });
    return result.nodeValue === true;
  }

  computeSingleEntryValue(situation: object, entry: string) {
    const local_engine = this.engine.shallowCopy();
    local_engine.setSituation(situation);
    return local_engine.evaluate(entry).nodeValue;
  }

  computeEntryListValues(
    situation: object,
    entryList: string[],
  ): Map<string, any> {
    const local_engine = this.engine.shallowCopy();
    local_engine.setSituation(situation);

    let result_map = new Map();

    for (const entry of entryList) {
      result_map.set(entry, local_engine.evaluate(entry).nodeValue);
    }

    return result_map;
  }

  computeBilanCarboneFromSituation(situation: object): BilanCarbone {
    const entryList = [
      'bilan',
      'transport',
      'transport . voiture',
      'transport . avion',
      'transport . deux roues',
      'transport . mobilité douce',
      'transport . bus',
      'transport . train',
      'transport . métro ou tram',
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
      'services publics',
      'services marchands',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    const total = resultMap.get('bilan') as number;

    const transport = resultMap.get('transport') as number;
    const transport_voiture = resultMap.get('transport . voiture') as number;
    const transport_avion = resultMap.get('transport . avion') as number;
    const transport_2roues = resultMap.get('transport . deux roues') as number;
    const transport_mob_douce = resultMap.get(
      'transport . mobilité douce',
    ) as number;
    const transport_bus = resultMap.get('transport . bus') as number;
    const transport_train = resultMap.get('transport . train') as number;
    const transport_metro = resultMap.get(
      'transport . métro ou tram',
    ) as number;
    const transport_vacances = resultMap.get('transport . vacances') as number;
    const transport_ferry = resultMap.get('transport . ferry') as number;

    const logement = resultMap.get('logement') as number;
    const logement_constr = resultMap.get('logement . construction') as number;
    const logement_elec = resultMap.get('logement . électricité') as number;
    const logement_chauf = resultMap.get('logement . chauffage') as number;
    const logement_clim = resultMap.get('logement . climatisation') as number;
    const logement_piscine = resultMap.get('logement . piscine') as number;
    const logement_ext = resultMap.get('logement . extérieur') as number;
    const logement_vacances = resultMap.get('logement . vacances') as number;

    const divers = resultMap.get('divers') as number;
    const divers_animaux = resultMap.get(
      'divers . animaux domestiques',
    ) as number;
    const divers_textile = resultMap.get('divers . textile') as number;
    const divers_electro = resultMap.get('divers . électroménager') as number;
    const divers_ameublement = resultMap.get('divers . ameublement') as number;
    const divers_numérique = resultMap.get('divers . numérique') as number;
    const divers_loisirs = resultMap.get('divers . loisirs') as number;
    const divers_autres_produits = resultMap.get(
      'divers . autres produits',
    ) as number;
    const divers_tabac = resultMap.get('divers . tabac') as number;

    const alimentation = resultMap.get('alimentation') as number;
    const alimentation_petit_dej = resultMap.get(
      'alimentation . petit déjeuner annuel',
    ) as number;

    let alimentation_viande = ((resultMap.get(
      'alimentation . plats . viande rouge',
    ) as number) +
      resultMap.get('alimentation . plats . viande blanche')) as number;
    alimentation_viande = alimentation_viande * 52;

    let alimentation_poisson = ((resultMap.get(
      'alimentation . plats . poisson gras',
    ) as number) +
      resultMap.get('alimentation . plats . poisson blanc')) as number;
    alimentation_poisson = alimentation_poisson * 52;

    let alimentation_fruits_legumes = ((resultMap.get(
      'alimentation . plats . végétarien',
    ) as number) +
      resultMap.get('alimentation . plats . végétalien')) as number;
    alimentation_fruits_legumes = alimentation_fruits_legumes * 52;

    const alimentation_boisson = resultMap.get(
      'alimentation . boisson',
    ) as number;

    const services_societaux = resultMap.get('services sociétaux') as number;
    const services_societaux_pub = resultMap.get('services publics') as number;
    const services_societaux_march = resultMap.get(
      'services marchands',
    ) as number;

    const impacts: ImpactUnivers[] = [];
    impacts.push({
      pourcentage: Math.round((transport / total) * 100),
      univers: Univers.transport,
      impact_kg_annee: transport,
      emoji: '🚦',
      details: [
        {
          label: 'Voiture',
          pourcentage: Math.round((transport_voiture / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_voiture / transport) * 100,
          ),
          impact_kg_annee: transport_voiture,
          emoji: '🚘️',
        },
        {
          label: 'Avion',
          pourcentage: Math.round((transport_avion / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_avion / transport) * 100,
          ),
          impact_kg_annee: transport_avion,
          emoji: '✈️',
        },
        {
          label: '2 roues',
          pourcentage: Math.round((transport_2roues / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_2roues / transport) * 100,
          ),
          impact_kg_annee: transport_2roues,
          emoji: '🛵',
        },
        {
          label: 'Mobilité douce',
          pourcentage: Math.round((transport_mob_douce / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_mob_douce / transport) * 100,
          ),
          impact_kg_annee: transport_mob_douce,
          emoji: '🚲',
        },
        {
          label: 'Transports en commun',
          pourcentage: Math.round(
            ((transport_bus + transport_metro) / total) * 100,
          ),
          pourcentage_categorie: Math.round(
            ((transport_bus + transport_metro) / transport) * 100,
          ),
          impact_kg_annee: transport_bus + transport_metro,
          emoji: '🚌',
        },
        {
          label: 'Train',
          pourcentage: Math.round((transport_train / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_train / transport) * 100,
          ),
          impact_kg_annee: transport_train,
          emoji: '🚋',
        },
        {
          label: 'Vacances',
          pourcentage: Math.round((transport_vacances / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_vacances / transport) * 100,
          ),
          impact_kg_annee: transport_vacances,
          emoji: '🏖️',
        },
        {
          label: 'Ferry',
          pourcentage: Math.round((transport_ferry / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_ferry / transport) * 100,
          ),
          impact_kg_annee: transport_ferry,
          emoji: '⛴',
        },
      ],
    });
    impacts.push({
      pourcentage: Math.round((logement / total) * 100),
      univers: Univers.logement,
      impact_kg_annee: logement,
      emoji: '🏠',
      details: [
        {
          label: 'Construction',
          pourcentage: Math.round((logement_constr / total) * 100),
          pourcentage_categorie: Math.round((logement_constr / logement) * 100),
          impact_kg_annee: logement_constr,
          emoji: '🧱',
        },
        {
          label: 'Electricité',
          pourcentage: Math.round((logement_elec / total) * 100),
          pourcentage_categorie: Math.round((logement_elec / logement) * 100),
          impact_kg_annee: logement_elec,
          emoji: '⚡',
        },
        {
          label: 'Chauffage',
          pourcentage: Math.round((logement_chauf / total) * 100),
          pourcentage_categorie: Math.round((logement_chauf / logement) * 100),
          impact_kg_annee: logement_chauf,
          emoji: '🔥',
        },
        {
          label: 'Climatisation',
          pourcentage: Math.round((logement_clim / total) * 100),
          pourcentage_categorie: Math.round((logement_clim / logement) * 100),
          impact_kg_annee: logement_clim,
          emoji: '❄️',
        },
        {
          label: 'Piscine',
          pourcentage: Math.round((logement_piscine / total) * 100),
          pourcentage_categorie: Math.round(
            (logement_piscine / logement) * 100,
          ),
          impact_kg_annee: logement_piscine,
          emoji: '🏊',
        },
        {
          label: 'Extérieur',
          pourcentage: Math.round((logement_ext / total) * 100),
          pourcentage_categorie: Math.round((logement_ext / logement) * 100),
          impact_kg_annee: logement_ext,
          emoji: '☘️',
        },
        {
          label: 'Vacances',
          pourcentage: Math.round((logement_vacances / total) * 100),
          pourcentage_categorie: Math.round(
            (logement_vacances / logement) * 100,
          ),
          impact_kg_annee: logement_vacances,
          emoji: '🏖',
        },
      ],
    });
    impacts.push({
      pourcentage: Math.round((divers / total) * 100),
      univers: Univers.consommation,
      impact_kg_annee: divers,
      emoji: '📦',
      details: [
        {
          label: 'Animaux',
          pourcentage: Math.round((divers_animaux / total) * 100),
          pourcentage_categorie: Math.round((divers_animaux / divers) * 100),
          impact_kg_annee: divers_animaux,
          emoji: '🐶',
        },
        {
          label: 'Electroménager',
          pourcentage: Math.round((divers_electro / total) * 100),
          pourcentage_categorie: Math.round((divers_electro / divers) * 100),
          impact_kg_annee: divers_electro,
          emoji: '🔌',
        },
        {
          label: 'Ameublement',
          pourcentage: Math.round((divers_ameublement / total) * 100),
          pourcentage_categorie: Math.round(
            (divers_ameublement / divers) * 100,
          ),
          impact_kg_annee: divers_ameublement,
          emoji: '🛋️',
        },
        {
          label: 'Numérique',
          pourcentage: Math.round((divers_numérique / total) * 100),
          pourcentage_categorie: Math.round((divers_numérique / divers) * 100),
          impact_kg_annee: divers_numérique,
          emoji: '📺',
        },
        {
          label: 'Loisirs',
          pourcentage: Math.round((divers_loisirs / total) * 100),
          pourcentage_categorie: Math.round((divers_loisirs / divers) * 100),
          impact_kg_annee: divers_loisirs,
          emoji: '🎭',
        },
        {
          label: 'Autres produits',
          pourcentage: Math.round((divers_autres_produits / total) * 100),
          pourcentage_categorie: Math.round(
            (divers_autres_produits / divers) * 100,
          ),
          impact_kg_annee: divers_autres_produits,
          emoji: '📦',
        },
        {
          label: 'Tabac',
          pourcentage: Math.round((divers_tabac / total) * 100),
          pourcentage_categorie: Math.round((divers_tabac / divers) * 100),
          impact_kg_annee: divers_tabac,
          emoji: '🚬',
        },
        {
          label: 'Textile',
          pourcentage: Math.round((divers_textile / total) * 100),
          pourcentage_categorie: Math.round((divers_textile / divers) * 100),
          impact_kg_annee: divers_textile,
          emoji: '👕',
        },
      ],
    });
    impacts.push({
      pourcentage: Math.round((alimentation / total) * 100),
      univers: Univers.alimentation,
      impact_kg_annee: alimentation,
      emoji: '🍴',
      details: [
        {
          label: 'Petit déjeuner',
          pourcentage: Math.round((alimentation_petit_dej / total) * 100),
          pourcentage_categorie: Math.round(
            (alimentation_petit_dej / alimentation) * 100,
          ),
          impact_kg_annee: alimentation_petit_dej,
          emoji: '🥐',
        },
        {
          label: 'Viandes',
          pourcentage: Math.round((alimentation_viande / total) * 100),
          pourcentage_categorie: Math.round(
            (alimentation_viande / alimentation) * 100,
          ),
          impact_kg_annee: alimentation_viande,
          emoji: '🥩',
        },
        {
          label: 'Poissons',
          pourcentage: Math.round((alimentation_poisson / total) * 100),
          pourcentage_categorie: Math.round(
            (alimentation_poisson / alimentation) * 100,
          ),
          impact_kg_annee: alimentation_poisson,
          emoji: '🐟',
        },
        {
          label: 'Fruits & Légumes',
          pourcentage: Math.round((alimentation_fruits_legumes / total) * 100),
          pourcentage_categorie: Math.round(
            (alimentation_fruits_legumes / alimentation) * 100,
          ),
          impact_kg_annee: alimentation_fruits_legumes,
          emoji: '🥦',
        },
        {
          label: 'Boissons',
          pourcentage: Math.round((alimentation_boisson / total) * 100),
          pourcentage_categorie: Math.round(
            (alimentation_boisson / alimentation) * 100,
          ),
          impact_kg_annee: alimentation_boisson,
          emoji: '🥤',
        },
      ],
    });

    const top_3 = this.computeTop3Details(impacts);

    impacts.push({
      pourcentage: Math.round((services_societaux / total) * 100),
      univers: Univers.services_societaux,
      impact_kg_annee: services_societaux,
      emoji: '🏛️',
      details: [
        {
          label: 'Services publics',
          pourcentage: Math.round((services_societaux_pub / total) * 100),
          pourcentage_categorie: Math.round(
            (services_societaux_pub / services_societaux) * 100,
          ),
          impact_kg_annee: services_societaux_pub,
          emoji: '🏛',
        },
        {
          label: 'Services marchands',
          pourcentage: Math.round((services_societaux_march / total) * 100),
          pourcentage_categorie: Math.round(
            (services_societaux_march / services_societaux) * 100,
          ),
          impact_kg_annee: services_societaux_march,
          emoji: '✉️',
        },
      ],
    });

    this.sortResult(impacts);

    return new BilanCarbone({
      impact_kg_annee: total,
      impact_univers: impacts,
      top_3: top_3,
    });
  }

  private sortResult(liste: ImpactUnivers[]) {
    liste.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    for (const univers of liste) {
      univers.details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    }
  }

  private computeTop3Details(liste_impacts: ImpactUnivers[]): DetailImpact[] {
    let liste_details: DetailImpact[] = [];
    for (const cat of liste_impacts) {
      liste_details = liste_details.concat(cat.details);
    }
    liste_details.sort((a, b) => b.pourcentage - a.pourcentage);
    return liste_details.slice(0, 3);
  }

  computeBilanFromSituation(situation: object): Bilan {
    const entryList = [
      'bilan',
      'transport',
      'logement',
      'divers',
      'alimentation',
      'services sociétaux',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    return {
      bilan_carbone_annuel: resultMap.get('bilan'),
      details: {
        transport: resultMap.get('transport'),
        logement: resultMap.get('logement'),
        divers: resultMap.get('divers'),
        alimentation: resultMap.get('alimentation'),
        services_societaux: resultMap.get('services sociétaux'),
      },
    };
  }
}
