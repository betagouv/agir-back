import { Injectable } from '@nestjs/common';
import Publicodes from 'publicodes';
import { formatValue } from 'publicodes';
import rulesRetrofit from '../data/aidesRetrofit.json';
import rulesVelo from '../data/aidesVelo.json';
import localisations from '../data/communes.json';
import aidesAndCollectivities from '../data/aides-collectivities.json';

type AideBase = {
  libelle: string;
  montant: string | null;
  plafond: string | null;
  lien: string;
  collectivite?: Collectivite;
  descritpion?: string;
};
interface Collectivite {
  kind: string;
  value: string;
  code?: string;
}
export type AidesRetroFit = Omit<AideBase, 'descritpion' | 'collectivite'>[];
type AidesVelo = AideBase[];

export type AidesVeloParType = {
  [category in TypeVelos]: AidesVelo;
};

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

type InputParameters = Partial<{
  'localisation . pays': string;
  'localisation . code insee': string;
  'localisation . epci': string;
  'localisation . département': string;
  'localisation . région': string;
  'localisation . ZFE': boolean;
  'vélo . type': TypeVelos;
  'vélo . prix': number;
  'revenu fiscal de référence': number;
}>;

type TypeVelos =
  | 'mécanique simple'
  | 'électrique'
  | 'cargo'
  | 'cargo électrique'
  | 'pliant'
  | 'motorisation';

@Injectable()
export class AidesRepository {
  async getAidesVelo(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesVeloParType> {
    return aidesVelo(codePostal, revenuFiscalDeReference);
  }

  async getAidesRetrofit(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesRetroFit> {
    return aidesRetrofit(codePostal, revenuFiscalDeReference);
  }
}

async function aidesRetrofit(
  codePostal: string,
  revenuFiscalDeReference: string,
): Promise<AidesRetroFit> {
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

async function aidesVelo(
  codePostal: string,
  revenuFiscalDeReference: string,
): Promise<AidesVeloParType> {
  const rules = rulesVelo as Record<string, any>;

  const lieu = getLocalisationByCP(codePostal);

  const engine = new Publicodes(rules);

  const situationBase: InputParameters = {
    'localisation . epci': `${lieu.epci}`,
    'localisation . région': `${lieu.region}`,
    'localisation . code insee': `${lieu.code}`,
    'revenu fiscal de référence': parseInt(revenuFiscalDeReference),
  };
  const veloTypes: Record<TypeVelos, any> = {
    'mécanique simple': {},
    électrique: {},
    cargo: {},
    'cargo électrique': {},
    pliant: {},
    motorisation: {},
  };

  for (const key of Object.keys(veloTypes)) {
    situationBase['vélo . type'] = key as keyof typeof veloTypes;
    veloTypes[key] = getAidesVelo(engine, situationBase);
  }

  return veloTypes;
}

function getAidesVelo(engine, situation: InputParameters = {}): AidesVelo {
  engine.setSituation(formatInput(situation));
  //maximiser les aides
  return Object.entries(aidesAndCollectivities)
    .filter(
      ([, { country: aideCountry }]) =>
        !situation['localisation . pays'] ||
        aideCountry === situation['localisation . pays'],
    )
    .flatMap(([ruleName]) => {
      try {
        const rule = engine.getRule(ruleName);
        const collectivity = aidesAndCollectivities[ruleName].collectivity;

        const metaData = {
          libelle: rule.title as string,
          description: rule.rawNode.description as string,
          lien: (rule.rawNode as any).lien as string,
          collectivite: collectivity as Collectivite,
          montant: null,
          plafond: null,
        };
        if (!situation['vélo . type']) {
          return [metaData];
        }
        const { nodeValue } = engine.evaluate({ valeur: ruleName, unité: '€' });
        if (typeof nodeValue === 'number' && nodeValue > 0) {
          return [
            {
              ...metaData,
              description: formatDescription({
                ruleName,
                engine,
                veloCat: situation['vélo . type'],
                ville: 'votre ville',
              }),
              montant: nodeValue,
              plafond: nodeValue,
            },
          ];
        } else {
          return [];
        }
      } catch (error) {
        return [];
      }
    });
}

const formatInput = (input: InputParameters) =>
  Object.fromEntries(
    Object.entries(input).map(([key, val]) => [
      key,
      typeof val === 'boolean'
        ? val
          ? 'oui'
          : 'non'
        : key === 'localisation . epci'
        ? `'${epciSirenToName[val]}'`
        : typeof val === 'string'
        ? `'${val}'`
        : val,
    ]),
  );

const epciSirenToName = Object.fromEntries(
  Object.values(aidesAndCollectivities).flatMap(({ collectivity }) => {
    if (collectivity.kind !== 'epci') {
      return [];
    }
    return [[(collectivity as any).code, collectivity.value]];
  }),
);

function getLocalisationByCP(cp: string): Localisation {
  const lieux = localisations as Localisation[];
  const lieu = lieux.find((lieu) => lieu.codesPostaux.includes(cp));
  return lieu;
}

const defaultDescription = '';
export function formatDescription({
  ruleName,
  engine,
  veloCat,
  ville,
}): string {
  const { rawNode } = engine.getRule(ruleName);
  const description = rawNode?.description ?? defaultDescription;
  const plafondRuleName = `${ruleName} . $plafond`;
  const plafondIsDefined = Object.keys(engine.getParsedRules()).includes(
    plafondRuleName,
  );
  const plafond = plafondIsDefined && engine.evaluate(plafondRuleName);
  return description
    .replace(
      /\$vélo/g,
      veloCat === 'motorisation' ? 'kit de motorisation' : `vélo ${veloCat}`,
    )
    .replace(
      /\$plafond/,
      formatValue(plafond?.nodeValue, { displayedUnit: '€' }),
    )
    .replace(/\$ville/, ville?.nom);
}
