import { Injectable } from '@nestjs/common';
import rules from './NGC_rules.json';
import Publicodes from 'publicodes';
import { Bilan } from '../../domain/bilan/bilan';

@Injectable()
export class NGCCalculator {
  private engine: Publicodes;

  constructor() {
    this.engine = new Publicodes(rules as Record<string, any>, {
      logger: {
        log(message: string) {},
        warn(message: string) {},
        error(message: string) {
          console.log(message);
        },
      },
    });
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

    entryList.forEach((entry) => {
      result_map.set(entry, local_engine.evaluate(entry).nodeValue);
    });

    return result_map;
  }

  computeBilanFromSituation(situation: object): Bilan {
    const entryList = [
      'bilan',
      'transport . empreinte',
      'logement',
      'divers',
      'alimentation',
      'services sociétaux',
    ];

    const resultMap = this.computeEntryListValues(situation, entryList);

    return {
      bilan_carbone_annuel: resultMap.get('bilan'),
      details: {
        transport: resultMap.get('transport . empreinte'),
        logement: resultMap.get('logement'),
        divers: resultMap.get('divers'),
        alimentation: resultMap.get('alimentation'),
        services_societaux: resultMap.get('services sociétaux'),
      },
    };
  }
}
