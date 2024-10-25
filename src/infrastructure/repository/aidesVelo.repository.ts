import { Injectable } from '@nestjs/common';
import {
  AidesVeloEngine,
  Questions,
  AideRuleNames,
  Aide,
} from '@betagouv/aides-velo';
import { Pick } from '@prisma/client/runtime/library.js';

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

/**
 * Required parameters to get the summary of the aids for the different types
 * of bikes.
 *
 * @note This is a subset of the {@link Questions} type.
 */
export type SummaryVelosParams = Required<
  Pick<
    Questions,
    | 'localisation . code insee'
    | 'vélo . prix'
    | 'aides . pays de la loire . abonné TER'
    | 'foyer . personnes'
    | 'revenu fiscal de référence par part . revenu de référence'
    | 'revenu fiscal de référence par part . nombre de parts'
  >
>;

@Injectable()
export class AidesVeloRepository {
  private engine: AidesVeloEngine;

  constructor() {
    this.engine = new AidesVeloEngine();
  }

  async getSummaryVelos(params: SummaryVelosParams): Promise<AidesVeloParType> {
    const commune = AidesVeloEngine.getCommuneByInseeCode(
      params['localisation . code insee'],
    );

    // NOTE: what should we do if the commune is not found? Or more generally
    // if there is an error with the computation?
    if (!commune) {
      // throw new Error(
      //   `Commune not found for code insee: ${params['localisation . code insee']}`,
      // );
    }

    const situationBase: Questions = {
      ...params,
      'localisation . epci': `${commune?.epci}`,
      'localisation . région': `${commune?.region}`,
      'localisation . code insee': `${commune?.code}`,
      'localisation . département': `${commune?.departement}`,
    };

    return this.getAidesVeloTousTypes(situationBase);
  }

  private getAidesVeloTousTypes(situationBase: Questions): AidesVeloParType {
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
      veloTypes[key] = this.engine
        .shallowCopy()
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
