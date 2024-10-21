import { Injectable } from '@nestjs/common';
import Engine from 'publicodes';
import { formatValue } from 'publicodes';
import rulesVelo from '../data/aidesVelo.json';
import localisations from '../repository/commune/communes.json';
import miniatures from '../data/miniatures.json';
import aidesAndCollectivities from '../data/aides-collectivities.json';
import {
  AidesVeloParType,
  InputParameters,
  AidesVelo,
  Localisation,
  Collectivite,
} from '../../domain/aides/aideVelo';
import { App } from '../../../src/domain/app';

// FIXME: need to have the commune name to differentiate between the different
// communes with the same postal code.
@Injectable()
export class AidesVeloRepository {
  async getSummaryVelos(
    codePostal: string,
    revenu_fiscal: number,
    parts_fiscal: number,
    prixVelo: number,
    is_abonnement?: boolean,
  ): Promise<AidesVeloParType> {
    const revenu_part = revenu_fiscal / parts_fiscal;
    if (is_abonnement === undefined) {
      is_abonnement = false;
    }
    return summaryVelo(codePostal, revenu_part, prixVelo, is_abonnement);
  }
}

function summaryVelo(
  codePostal: string,
  revenuParPart: number,
  prixVelo: number,
  is_abonnement: boolean,
): AidesVeloParType {
  const lieu = getLocalisationByCP(codePostal);
  const rules = rulesVelo as Record<string, any>;
  delete rules['aides . prime à la conversion'];
  delete rules['aides . prime à la conversion . surprime ZFE'];

  // NOTE: should we create a new engine for each request?
  const engine = new Engine(rules, {
    logger: {
      log(message: string) {},
      warn(message: string) {},
      error(message: string) {
        console.log(message);
      },
    },
  });
  const situationBase: InputParameters = {
    'localisation . epci': `${lieu?.epci}`,
    'localisation . région': `${lieu?.region}`,
    'localisation . code insee': `${lieu?.code}`,
    'localisation . département': `${lieu?.departement}`,
    'revenu fiscal de référence': revenuParPart, // revenu fiscal de référence par part
    'vélo . prix': prixVelo,
    // TODO: should be refactor to be dynamically retrieved from the rules or
    // to be a unique rule: 'abonné TER' used in all the rules needing it.
    'aides . pays de la loire . abonné TER': is_abonnement,
  };
  return getAidesVeloTousTypes(situationBase, engine);
}

function getAidesVeloTousTypes(
  situationBase: InputParameters,
  engine: Engine,
): AidesVeloParType {
  const veloTypes: AidesVeloParType = {
    'mécanique simple': [],
    électrique: [],
    cargo: [],
    'cargo électrique': [],
    pliant: [],
    motorisation: [],
    adapté: [],
  };

  for (const key of Object.keys(veloTypes)) {
    situationBase['vélo . type'] = key as keyof typeof veloTypes;
    veloTypes[key] = getAidesVeloParType(engine, situationBase);
  }

  return veloTypes;
}

function getAidesVeloParType(
  engine: Engine,
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
          logo: App.getAideVeloMiniaturesURL() + miniatures[ruleName],
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

const formatInput = (input: InputParameters) => {
  const entries = Object.entries(input);

  const transformedEntries = entries.map(([key, val]) => {
    let transformedVal;

    if (typeof val === 'boolean') {
      transformedVal = val ? 'oui' : 'non';
    } else if (key === 'localisation . epci') {
      transformedVal = `'${epciSirenToName[val] || val}'`;
    } else if (typeof val === 'string') {
      transformedVal = `'${val}'`;
    } else {
      transformedVal = val;
    }

    return [key, transformedVal];
  });

  const transformedInput = Object.fromEntries(transformedEntries);

  return transformedInput;
};

const epciSirenToName = Object.fromEntries(
  Object.values(aidesAndCollectivities).flatMap(({ collectivity }) => {
    if (collectivity.kind !== 'epci') {
      return [];
    }
    return [[(collectivity as any).code, collectivity.value]];
  }),
);

// FIXME: should use the commune name to differentiate between the different
// communes with the same postal code.
function getLocalisationByCP(cp: string): Localisation | undefined {
  const lieux = localisations as Localisation[];
  // FIXME AIDE : sens fonctionel du premier match ?
  const lieu = lieux.find((lieu) => {
    return lieu.codesPostaux.includes(cp);
  });
  return lieu;
}

export function formatDescription({
  ruleName,
  engine,
  veloCat,
  ville,
}): string {
  const { rawNode } = engine.getRule(ruleName);
  const description = rawNode?.description ?? '';
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
