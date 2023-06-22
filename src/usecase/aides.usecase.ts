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
  code: string;
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
      'localisation . région': `'${lieu.region}'`,
      'localisation . code insee': `'${lieu.code}'`,
      'revenu fiscal de référence': `'${revenuFiscalDeReference}€/an'`,
    };
    engine.setSituation(situation); //.evaluate('aides').nodeValue;

    const activeAides = aides.filter(
      (a) => engine.evaluate(a).nodeValue !== null,
    );

    const result = activeAides.map((aide) => {
      const aideBrut: {
        nom: string;
        titre: string;
        plafond: string;
        lien: string;
      } = engine.getRule(aide).rawNode as any;

      return {
        libelle: aideBrut.titre,
        montant: engine.evaluate(aideBrut.nom).nodeValue,
        plafond: aideBrut?.plafond || '',
        lien: aideBrut?.lien || '',
      };
    });

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
