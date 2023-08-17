import { Injectable } from '@nestjs/common';
import Publicodes from 'publicodes';
import { Aide } from '../../../src/domain/aide';
import rulesRetrofit from '../data/aidesRetrofit.json';
import rulesVelo from '../data/aidesVelo.json';
import localisations from '../data/communes.json';

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
export class AidesRepository {
  async get(
    codePostal: string,
    revenuFiscalDeReference: string,
    type: 'retrofit' | 'velo',
  ): Promise<Aide[]> {
    let rules = rulesRetrofit as Record<string, any>;
    if (type !== 'retrofit') {
      rules = rulesVelo as Record<string, any>;
    }
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
    engine.setSituation(situation);

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
        montant: engine.evaluate(aideBrut.nom).nodeValue.toString() || '',
        plafond: aideBrut?.plafond || '',
        lien: aideBrut?.lien || '',
      };
    });

    return result;
  }
}

function getLocalisationByCP(cp: string): Localisation {
  const lieux = localisations as Localisation[];
  const lieu = lieux.find((lieu) => lieu.codesPostaux.includes(cp));
  return lieu;
}
