import { Injectable } from '@nestjs/common';
// FIXME: use the @betagouv/publicodes-aides-velo package when published
import {
  AidesVeloEngine,
  Questions,
  AideRuleNames,
  Aide,
} from '../../../../publicodes-aides-velo/dist/src/index.js';
import { AideVelo, AidesVeloParType } from '../../domain/aides/aideVelo';
import { App } from '../../../src/domain/app';

/**
 * Aids to exclude from the results.
 *
 * NOTE: this is to match the initial behavior of this repository. However, it
 * should be reconsidered whether we really want to exclude these aids.
 */
const AIDES_TO_EXCLUDE: AideRuleNames[] = [
  'aides . prime à la conversion',
  'aides . prime à la conversion . surprime ZFE',
];

@Injectable()
export class AidesVeloRepository {
  async getSummaryVelos({
    code_insee,
    revenu_fiscal_par_part,
    prix_velo,
    abonnement_ter_loire = false,
  }: {
    // NOTE: shouldn't we use Questions type here?
    code_insee: string;
    revenu_fiscal_par_part: number;
    prix_velo: number;
    // FIXME: should be refactor to be dynamically retrieved from the rules or
    // to be a unique rule: 'abonné TER' used in all the rules needing it.
    abonnement_ter_loire?: boolean;
  }): Promise<AidesVeloParType> {
    // NOTE: should we create a new engine for each request?
    const engine = new AidesVeloEngine();
    const commune = AidesVeloEngine.getCommuneByInseeCode(code_insee);

    const situationBase: Questions = {
      'localisation . epci': `${commune?.epci}`,
      'localisation . région': `${commune?.region}`,
      'localisation . code insee': `${commune?.code}`,
      'localisation . département': `${commune?.departement}`,
      'revenu fiscal de référence': revenu_fiscal_par_part,
      'vélo . prix': prix_velo,
      // TODO: should be refactor to be dynamically retrieved from the rules or
      // to be a unique rule: 'abonné TER' used in all the rules needing it.
      'aides . pays de la loire . abonné TER': abonnement_ter_loire,
    };

    return getAidesVeloTousTypes(situationBase, engine);
  }
}

function getAidesVeloTousTypes(
  situationBase: Questions,
  engine: AidesVeloEngine,
): AidesVeloParType {
  const veloTypes: AidesVeloParType = {
    'mécanique simple': [],
    électrique: [],
    cargo: [],
    'cargo électrique': [],
    pliant: [],
    'pliant électrique': [],
    motorisation: [],
    adapté: [],
  };

  for (const key of Object.keys(veloTypes)) {
    situationBase['vélo . type'] = key as keyof typeof veloTypes;
    veloTypes[key] = engine
      .setInputs(situationBase)
      .computeAides()
      .filter(({ id }) => !AIDES_TO_EXCLUDE.includes(id))
      .map(
        (aide: Aide) => ({
          libelle: aide.title,
          montant: aide.amount,
          // NOTE: this is legacy behavior, the plafond is the same as the
          // amount we should consider removing this field or implementing it
          // correctly.
          // NOTE: after checking, it seems that the plafond is only used for
          // the aides retrofits repository, they shouldn't share the same type
          // or it should be refactored to have a generic type.
          plafond: aide.amount,
          description: aide.description,
          lien: aide.url,
          collectivite: aide.collectivity,
          logo: App.getAideVeloMiniaturesURL() + aide.logo,
        }),
        // HACK: limits of TS inference, without this, there is no error when
        // returning an array of `Aide` instead of `AideVelo`.
      ) as AideVelo[];
  }

  return veloTypes;
}

// function getAidesVeloParType(
//   engine: Engine,
//   situation: InputParameters = {},
// ): AidesVelo {
//   engine.setSituation(formatInput(situation));
//
//   //maximiser les aides
//   const aides = Object.entries(aidesAndCollectivities)
//     .filter(
//       ([, { country: aideCountry }]) =>
//         !situation['localisation . pays'] ||
//         aideCountry === situation['localisation . pays'],
//     )
//     .flatMap(([ruleName]) => {
//       try {
//         const rule = engine.getRule(ruleName);
//         const collectivity = aidesAndCollectivities[ruleName].collectivity;
//
//         const metaData = {
//           libelle: rule.title as string,
//           description: rule.rawNode.description as string,
//           lien: (rule.rawNode as any).lien as string,
//           collectivite: collectivity as Collectivite,
//           montant: null,
//           plafond: null,
//           logo: App.getAideVeloMiniaturesURL() + miniatures[ruleName],
//         };
//         if (!situation['vélo . type']) {
//           return [metaData];
//         }
//         const { nodeValue } = engine.evaluate({ valeur: ruleName, unité: '€' });
//
//         if (typeof nodeValue === 'number' && nodeValue > 0) {
//           return [
//             {
//               ...metaData,
//               description: formatDescription({
//                 ruleName,
//                 engine,
//                 veloCat: situation['vélo . type'],
//                 ville: 'votre ville',
//               }),
//               montant: nodeValue,
//               plafond: nodeValue,
//             },
//           ];
//         } else {
//           return [];
//         }
//       } catch (error) {
//         return [];
//       }
//     });
//   return aides;
// }
//
// const formatInput = (input: InputParameters) => {
//   const entries = Object.entries(input);
//
//   const transformedEntries = entries.map(([key, val]) => {
//     let transformedVal;
//
//     if (typeof val === 'boolean') {
//       transformedVal = val ? 'oui' : 'non';
//     } else if (key === 'localisation . epci') {
//       transformedVal = `'${epciSirenToName[val] || val}'`;
//     } else if (typeof val === 'string') {
//       transformedVal = `'${val}'`;
//     } else {
//       transformedVal = val;
//     }
//
//     return [key, transformedVal];
//   });
//
//   const transformedInput = Object.fromEntries(transformedEntries);
//
//   return transformedInput;
// };
//
// const epciSirenToName = Object.fromEntries(
//   Object.values(aidesAndCollectivities).flatMap(({ collectivity }) => {
//     if (collectivity.kind !== 'epci') {
//       return [];
//     }
//     return [[(collectivity as any).code, collectivity.value]];
//   }),
// );
//
// // FIXME: should use the commune name to differentiate between the different
// // communes with the same postal code.
// function getLocalisationByCP(cp: string): Localisation | undefined {
//   const lieux = localisations as Localisation[];
//   // FIXME AIDE : sens fonctionel du premier match ?
//   const lieu = lieux.find((lieu) => {
//     return lieu.codesPostaux.includes(cp);
//   });
//   return lieu;
// }
//
// export function formatDescription({
//   ruleName,
//   engine,
//   veloCat,
//   ville,
// }): string {
//   const { rawNode } = engine.getRule(ruleName);
//   const description = rawNode?.description ?? '';
//   const plafondRuleName = `${ruleName} . $plafond`;
//   const plafondIsDefined = Object.keys(engine.getParsedRules()).includes(
//     plafondRuleName,
//   );
//   const plafond = plafondIsDefined && engine.evaluate(plafondRuleName);
//   return description
//     .replace(
//       /\$vélo/g,
//       veloCat === 'motorisation' ? 'kit de motorisation' : `vélo ${veloCat}`,
//     )
//     .replace(
//       /\$plafond/,
//       formatValue(plafond?.nodeValue, { displayedUnit: '€' }),
//     )
//     .replace(/\$ville/, ville?.nom);
// }
