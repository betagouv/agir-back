import { Injectable } from '@nestjs/common';
import Publicodes from 'publicodes';
import communes from '@etalab/decoupage-administratif/data/communes.json';

import rulesRetrofit from '../data/aidesRetrofit.json';
import { AideVelo } from '../../domain/aides/aideVelo';

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

  // FIXME: should be refactored to have its own type
  // @ts-ignore
  return result;
}

function getLocalisationByCP(cp: string) {
  // FIXME: this function must be removed and replaced by the CommuneRepository
  // methods in the same way as in aidesVelo.repository.ts.
  // @ts-ignore
  const lieu = communes.find((lieu) => lieu.codesPostaux.includes(cp));
  return lieu;
}
