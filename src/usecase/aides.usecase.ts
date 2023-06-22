import { Injectable } from '@nestjs/common';
//import { engine } from 'src/infrastructure/repository/engine';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import Publicodes from 'publicodes';

type AidesVelo = any;
type Localisation = {
  nom: string;
  slug: string;
  epci: string;
  zfe: string;
  codeInsee: string;
  codesPostaux: string[];
  departement: string;
  region: string;
  pays: string;
};

@Injectable()
export class AidesUsecase {
  async getRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesVelo> {
    const rules = yaml.load(
      fs.readFileSync(
        path.resolve(__dirname, '../publicode/retrofit.yaml'),
        'utf8',
      ),
    ) as Record<string, any>;

    const lieu = getLocalisationByCP(codePostal);

    const aides = Object.keys(rules).filter((aideName) =>
      aideName.startsWith('aides . '),
    );

    const engine = new Publicodes(rules);

    const situation = {
      'localisation . epci': `'${lieu.epci}'`,
      'revenu fiscal de référence': `'${revenuFiscalDeReference}€/an'`,
    };
    const result = engine.setSituation(situation).evaluate('aides').nodeValue;

    return result;
  }
}

function getLocalisationByCP(cp: string): Localisation {
  const lieux = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../publicode/communes.json'),
      'utf8',
    ),
  ) as Localisation[];
  const lieu = lieux.find((lieu) => lieu.codesPostaux.includes(cp));
  return lieu;
}
