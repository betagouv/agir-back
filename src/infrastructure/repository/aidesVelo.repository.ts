import { Injectable } from '@nestjs/common';
import Publicodes from 'publicodes';
import { formatValue } from 'publicodes';
import rulesVelo from '../data/aidesVelo.json';
import localisations from '../data/communes.json';
import miniatures from '../data/miniatures.json';
import aidesAndCollectivities from '../data/aides-collectivities.json';

export type AideBase = {
  libelle: string;
  montant: string | null;
  plafond: string | null;
  lien: string;
  collectivite?: Collectivite;
  descritpion?: string;
  logo?: string;
};
interface Collectivite {
  kind: string;
  value: string;
  code?: string;
}
type AidesVelo = AideBase[];

export type AidesVeloParType = {
  [category in TypeVelos]: number;
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
  'vélo . prix': string;
  'revenu fiscal de référence': number;
  'maximiser les aides'?: 'oui' | 'non';
}>;

type TypeVelos =
  | 'mécanique simple'
  | 'électrique'
  | 'cargo'
  | 'cargo électrique'
  | 'pliant'
  | 'motorisation';

@Injectable()
export class AidesVeloRepository {
  async getSummaryVelos(
    codePostal: string,
    revenuFiscalDeReference: string,
  ): Promise<AidesVeloParType> {
    return summaryVelo(codePostal, revenuFiscalDeReference);
  }
}

function summaryVelo(
  codePostal: string,
  revenuFiscalDeReference: string,
): AidesVeloParType {
  const lieu = getLocalisationByCP(codePostal);

  const rules = rulesVelo as Record<string, any>;
  const engine = new Publicodes(rules);
  const situationBase: InputParameters = {
    'localisation . epci': `${lieu.epci}`,
    'localisation . région': `${lieu.region}`,
    'localisation . code insee': `${lieu.code}`,
    'revenu fiscal de référence': parseInt(revenuFiscalDeReference),
  };
  return getAidesVeloTousTypes(situationBase, engine);
}

function getAidesVeloTousTypes(
  situationBase: InputParameters,
  engine: any,
): AidesVeloParType {
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
    veloTypes[key] = getAidesVeloParType(engine, situationBase);
  }

  return veloTypes;
}

function getAidesVeloParType(
  engine,
  situation: InputParameters = {},
): AidesVelo {
  engine.setSituation(formatInput(situation));
  //maximiser les aides
  const aides = Object.entries(aidesAndCollectivities)
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
          logo: 'https://mesaidesvelo.fr/miniatures/' + miniatures[ruleName],
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
  return aides;
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

/*function getAidesVeloTousTypes(
  situationBase: InputParameters,
  engine: any,
): AidesVeloParType {
  const veloTypes: Record<TypeVelos, any> = {
    'mécanique simple': {},
    électrique: {},
    cargo: {},
    'cargo électrique': {},
    pliant: {},
    motorisation: {},
  };

  for (const key of Object.keys(veloTypes)) {
    engine.setSituation(
      formatInput({
        ...situationBase,
        'vélo . type': key as keyof typeof veloTypes,
      }),
    );
    veloTypes[key] = engine.evaluate({
      valeur: 'aides . montant',
      unité: '€',
    }).nodeValue;
  }

  const prime = engine
    .setSituation(
      formatInput({
        ...situationBase,
        'vélo . prix': '10000 €',
      }),
    )
    .evaluate('aides . prime à la conversion').nodeValue;
  console.log(situationBase);

  return { ...veloTypes, prime };
}*/
