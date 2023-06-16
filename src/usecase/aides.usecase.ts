import { Injectable } from '@nestjs/common';
//import { engine } from 'src/infrastructure/repository/engine';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import Publicodes from 'publicodes';

type AidesVelo = any;

@Injectable()
export class AidesUsecase {
  async getRetrofitCitoyen(citoyenId): Promise<AidesVelo> {
    const rules = yaml.load(
      fs.readFileSync(
        path.resolve(__dirname, '../publicode/retrofit.yaml'),
        'utf8',
      ),
    ) as Record<string, any>;

    const aides = Object.keys(rules).filter((aideName) =>
      aideName.startsWith('aides . '),
    );
    console.log(aides);

    const engine = new Publicodes(rules);

    const situation = {
      'localisation . epci': "'Métropole de Lyon'",
      'revenu fiscal de référence': '2500€/mois',
    };
    const result = engine.setSituation(situation).evaluate('aides').nodeValue;

    return result;
  }
}
