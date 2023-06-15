import { Injectable } from '@nestjs/common';
import { engine } from 'src/infrastructure/repository/engine';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';

type AidesVelo = object;

@Injectable()
export class AidesVeloUsecase {
  //constructor(private citoyenRespoitory: CitoyenRepository) {}

  async getAidesVeloByCitoyen(citoyenId): Promise<AidesVelo> {
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

    const situation = {
      'localisation . epci': "'Métropole de Lyon'",
      'revenu fiscal de référence': '500€/mois',
    };
    engine.setSituation(situation);
    const activeAides = aides.filter(
      (aide) => engine.evaluate(aide).nodeValue !== null,
    );

    const result = activeAides.map((aide) => engine.getRule(aide).rawNode);
    return result;
  }
}
