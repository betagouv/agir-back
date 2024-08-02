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
      'logement',
      'divers',
      'alimentation',
      'services sociétaux',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    const total = resultMap.get('bilan') as number;
    const transport = resultMap.get('transport') as number;
    const logement = resultMap.get('logement') as number;
    const divers = resultMap.get('divers') as number;
    const alimentation = resultMap.get('alimentation') as number;
    const services_societaux = resultMap.get('services sociétaux') as number;

    const impacts: ImpactUnivers[] = [];
    impacts.push({
      pourcentage: Math.round((transport / total) * 100),
      univers: Univers.transport,
      impact_kg_annee: transport,
    });
    impacts.push({
      pourcentage: Math.round((logement / total) * 100),
      univers: Univers.logement,
      impact_kg_annee: logement,
    });
    impacts.push({
      pourcentage: Math.round((divers / total) * 100),
      univers: Univers.consommation,
      impact_kg_annee: divers,
    });
    impacts.push({
      pourcentage: Math.round((alimentation / total) * 100),
      univers: Univers.alimentation,
      impact_kg_annee: alimentation,
    });
    impacts.push({
      pourcentage: Math.round((services_societaux / total) * 100),
      univers: Univers.services_societaux,
      impact_kg_annee: services_societaux,
    });

    impacts.sort((a, b) => b.impact_kg_annee - a.impact_kg_annee);

    return new BilanCarbone({
      impact_kg_annee: total,
      detail: impacts,
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
