import { Injectable } from '@nestjs/common';
import Publicodes from 'publicodes';
import rulesRetrofit from '../data/aidesRetrofit.json';
import localisations from '../../infrastructure/repository/commune/communes.json';

import { AideVelo, Localisation } from '../../domain/aides/aideVelo';

@Injectable()
export class AidesRetrofitRepository {
  async get(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AideVelo[]> {
    return aidesRetrofit(codePostal, revenuFiscalDeReference);
  }
}

async function aidesRetrofit(
  codePostal: string,
  revenuFiscalDeReference: string,
): Promise<AideVelo[]> {
  const rules = rulesRetrofit as Record<string, any>;

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

function getLocalisationByCP(cp: string): Localisation {
  const lieux = localisations as Localisation[];
  const lieu = lieux.find((lieu) => lieu.codesPostaux.includes(cp));
  return lieu;
}
