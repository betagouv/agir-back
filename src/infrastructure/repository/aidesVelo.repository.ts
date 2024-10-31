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
    | 'localisation . epci'
    | 'localisation . région'
    | 'localisation . département'
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
    const situationBase: Questions = {
      ...params,
      'localisation . pays': 'France',
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
