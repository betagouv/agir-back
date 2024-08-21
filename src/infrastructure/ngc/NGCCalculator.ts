import { Injectable } from '@nestjs/common';
import { Bilan } from '../../domain/bilan/bilan';
import rules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json';
import Engine, { ParsedRules, PublicodesError } from 'publicodes';
import { BilanCarbone, ImpactUnivers } from '../../domain/bilan/bilanCarbone';
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
      'alimentation',
      'services sociétaux',
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
    const alimentation = resultMap.get('alimentation') as number;
    const services_societaux = resultMap.get('services sociétaux') as number;

    const impacts: ImpactUnivers[] = [];
    impacts.push({
      pourcentage: Math.round((transport / total) * 100),
      univers: Univers.transport,
      impact_kg_annee: transport,
      details: [
        {
          label: 'Voiture',
          pourcentage: Math.round((transport_voiture / transport) * 100),
          impact_kg_annee: transport_voiture,
        },
        {
          label: 'Avion',
          pourcentage: Math.round((transport_avion / transport) * 100),
          impact_kg_annee: transport_avion,
        },
        {
          label: '2 roues',
          pourcentage: Math.round((transport_2roues / transport) * 100),
          impact_kg_annee: transport_2roues,
        },
        {
          label: 'Mobilité douce',
          pourcentage: Math.round((transport_mob_douce / transport) * 100),
          impact_kg_annee: transport_mob_douce,
        },
        {
          label: 'Transports en commun',
          pourcentage: Math.round(
            ((transport_bus + transport_metro) / transport) * 100,
          ),
          impact_kg_annee: transport_bus + transport_metro,
        },
        {
          label: 'Train',
          pourcentage: Math.round((transport_train / transport) * 100),
          impact_kg_annee: transport_train,
        },
        {
          label: 'Vacances',
          pourcentage: Math.round((transport_vacances / transport) * 100),
          impact_kg_annee: transport_vacances,
        },
        {
          label: 'Ferry',
          pourcentage: Math.round((transport_ferry / transport) * 100),
          impact_kg_annee: transport_ferry,
        },
      ],
    });
    impacts.push({
      pourcentage: Math.round((logement / total) * 100),
      univers: Univers.logement,
      impact_kg_annee: logement,
      details: [
        {
          label: 'Construction',
          pourcentage: Math.round((logement_constr / logement) * 100),
          impact_kg_annee: logement_constr,
        },
        {
          label: 'Electricité',
          pourcentage: Math.round((logement_elec / logement) * 100),
          impact_kg_annee: logement_elec,
        },
        {
          label: 'Chauffage',
          pourcentage: Math.round((logement_chauf / logement) * 100),
          impact_kg_annee: logement_chauf,
        },
        {
          label: 'Climatisation',
          pourcentage: Math.round((logement_clim / logement) * 100),
          impact_kg_annee: logement_clim,
        },
        {
          label: 'Piscine',
          pourcentage: Math.round((logement_piscine / logement) * 100),
          impact_kg_annee: logement_piscine,
        },
        {
          label: 'Extérieur',
          pourcentage: Math.round((logement_ext / logement) * 100),
          impact_kg_annee: logement_ext,
        },
        {
          label: 'Vacances',
          pourcentage: Math.round((logement_vacances / logement) * 100),
          impact_kg_annee: logement_vacances,
        },
      ],
    });
    impacts.push({
      pourcentage: Math.round((divers / total) * 100),
      univers: Univers.consommation,
      impact_kg_annee: divers,
      details: [],
    });
    impacts.push({
      pourcentage: Math.round((alimentation / total) * 100),
      univers: Univers.alimentation,
      impact_kg_annee: alimentation,
      details: [],
    });
    impacts.push({
      pourcentage: Math.round((services_societaux / total) * 100),
      univers: Univers.services_societaux,
      impact_kg_annee: services_societaux,
      details: [],
    });

    impacts.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    for (const univers of impacts) {
      univers.details.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);
    }
    return new BilanCarbone({
      impact_kg_annee: total,
      impact_univers: impacts,
    });
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
