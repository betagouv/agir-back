import { Injectable } from '@nestjs/common';
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
import Engine, { ParsedRules, PublicodesError } from 'publicodes';
import {
  BilanCarbone,
  DetailImpact,
  ImpactThematique,
} from '../../domain/bilan/bilanCarbone';
import { Bilan_OLD } from '../../domain/bilan/bilan_old';
import { Thematique } from '../../domain/contenu/thematique';

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

    const total = this.getValueFromMap(resultMap, 'bilan');

    const transport = this.getValueFromMap(resultMap, 'transport');
    const transport_voiture = this.getValueFromMap(
      resultMap,
      'transport . voiture',
    );
    const transport_avion = this.getValueFromMap(
      resultMap,
      'transport . avion',
    );
    const transport_2roues = this.getValueFromMap(
      resultMap,
      'transport . deux roues',
    );
    const transport_mob_douce = this.getValueFromMap(
      resultMap,
      'transport . mobilité douce',
    );
    const transport_commun = this.getValueFromMap(
      resultMap,
      'transport . transports commun',
    );
    const transport_train = this.getValueFromMap(
      resultMap,
      'transport . train',
    );
    const transport_vacances = this.getValueFromMap(
      resultMap,
      'transport . vacances',
    );
    const transport_ferry = this.getValueFromMap(
      resultMap,
      'transport . ferry',
    );

    const logement = this.getValueFromMap(resultMap, 'logement');
    const logement_constr = this.getValueFromMap(
      resultMap,
      'logement . construction',
    );
    const logement_elec = this.getValueFromMap(
      resultMap,
      'logement . électricité',
    );
    const logement_chauf = this.getValueFromMap(
      resultMap,
      'logement . chauffage',
    );
    const logement_clim = this.getValueFromMap(
      resultMap,
      'logement . climatisation',
    );
    const logement_piscine = this.getValueFromMap(
      resultMap,
      'logement . piscine',
    );
    const logement_ext = this.getValueFromMap(
      resultMap,
      'logement . extérieur',
    );
    const logement_vacances = this.getValueFromMap(
      resultMap,
      'logement . vacances',
    );

    const divers = this.getValueFromMap(resultMap, 'divers');
    const divers_animaux = this.getValueFromMap(
      resultMap,
      'divers . animaux domestiques',
    );
    const divers_textile = this.getValueFromMap(resultMap, 'divers . textile');
    const divers_electro = this.getValueFromMap(
      resultMap,
      'divers . électroménager',
    );
    const divers_ameublement = this.getValueFromMap(
      resultMap,
      'divers . ameublement',
    );
    const divers_numérique = this.getValueFromMap(
      resultMap,
      'divers . numérique',
    );
    const divers_loisirs = this.getValueFromMap(resultMap, 'divers . loisirs');
    const divers_autres_produits = this.getValueFromMap(
      resultMap,
      'divers . autres produits',
    );
    const divers_tabac = this.getValueFromMap(resultMap, 'divers . tabac');

    const alimentation = this.getValueFromMap(resultMap, 'alimentation');
    const alimentation_petit_dej = this.getValueFromMap(
      resultMap,
      'alimentation . petit déjeuner annuel',
    );

    let alimentation_viande =
      (this.getValueFromMap(
        resultMap,
        'alimentation . plats . viande rouge',
      ) as number) +
      this.getValueFromMap(resultMap, 'alimentation . plats . viande blanche');
    alimentation_viande = alimentation_viande * 52;

    let alimentation_poisson =
      (this.getValueFromMap(
        resultMap,
        'alimentation . plats . poisson gras',
      ) as number) +
      this.getValueFromMap(resultMap, 'alimentation . plats . poisson blanc');
    alimentation_poisson = alimentation_poisson * 52;

    let alimentation_fruits_legumes =
      (this.getValueFromMap(
        resultMap,
        'alimentation . plats . végétarien',
      ) as number) +
      this.getValueFromMap(resultMap, 'alimentation . plats . végétalien');
    alimentation_fruits_legumes = alimentation_fruits_legumes * 52;

    const alimentation_boisson = this.getValueFromMap(
      resultMap,
      'alimentation . boisson',
    );

    const services_societaux = this.getValueFromMap(
      resultMap,
      'services sociétaux',
    );
    const services_societaux_pub = this.getValueFromMap(
      resultMap,
      'services sociétaux . services publics',
    );
    const services_societaux_march = this.getValueFromMap(
      resultMap,
      'services sociétaux . services marchands',
    );

    const impacts: ImpactThematique[] = [];
    impacts.push({
      pourcentage: Math.round((transport / total) * 100),
      thematique: Thematique.transport,
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
          pourcentage: Math.round((transport_commun / total) * 100),
          pourcentage_categorie: Math.round(
            (transport_commun / transport) * 100,
          ),
          impact_kg_annee: transport_commun,
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
      thematique: Thematique.logement,
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
      thematique: Thematique.consommation,
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
      thematique: Thematique.alimentation,
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
      thematique: Thematique.services_societaux,
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
      impact_thematique: impacts,
      top_3: top_3,
    });
  }

  private getValueFromMap(map: Map<string, any>, key: string): number {
    const result = map.get(key) as number;
    return result ? result : 0;
  }

  private sortResult(liste: ImpactThematique[]) {
    liste.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    for (const thematique of liste) {
      thematique.details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    }
  }

  private computeTop3Details(
    liste_impacts: ImpactThematique[],
  ): DetailImpact[] {
    let liste_details: DetailImpact[] = [];
    for (const cat of liste_impacts) {
      liste_details = liste_details.concat(cat.details);
    }
    liste_details.sort((a, b) => b.pourcentage - a.pourcentage);
    return liste_details.slice(0, 3);
  }

  computeBilanFromSituation(situation: object): Bilan_OLD {
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
      bilan_carbone_annuel: this.getValueFromMap(resultMap, 'bilan'),
      details: {
        transport: this.getValueFromMap(resultMap, 'transport'),
        logement: this.getValueFromMap(resultMap, 'logement'),
        divers: this.getValueFromMap(resultMap, 'divers'),
        alimentation: this.getValueFromMap(resultMap, 'alimentation'),
        services_societaux: this.getValueFromMap(
          resultMap,
          'services sociétaux',
        ),
      },
    };
  }
}
