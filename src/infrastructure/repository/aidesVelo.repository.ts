import { Injectable } from '@nestjs/common';

import {
  Aide,
  AideRuleNames,
  AidesVeloEngine,
  Questions,
} from '@betagouv/aides-velo';

import { App } from '../../../src/domain/app';
import miniatures from '../../../src/infrastructure/data/miniatures.json';
import {
  AideVeloNonCalculee,
  AidesVeloParType,
  Collectivite,
} from '../../domain/aides/aideVelo';

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
    | 'foyer . personnes'
    | 'revenu fiscal de référence par part . revenu de référence'
    | 'revenu fiscal de référence par part . nombre de parts'
    | 'vélo . état'
    | 'demandeur . en situation de handicap'
    | 'demandeur . âge'
  >
>;

type Localisation = Pick<
  Questions,
  | 'localisation . pays'
  | 'localisation . département'
  | 'localisation . région'
  | 'localisation . epci'
  | 'localisation . code insee'
>;

@Injectable()
export class AidesVeloRepository {
  private engine: AidesVeloEngine;

  constructor() {
    this.engine = new AidesVeloEngine();
  }

  getSummaryVelos(params: SummaryVelosParams): AidesVeloParType {
    const situationBase: Questions = {
      ...params,
      'localisation . pays': 'France',
    };

    return this.getAidesVeloTousTypes(situationBase);
  }

  /**
   * Get all the aids available for the given location.
   *
   * @param localisation - The location to get the aids for. If a field is omitted, all the aids for this scope will be ignored.
   * @return The list of all the aids available for the given location. Note that they aren't computed, therefore, there is no `montant` or `plafond` field.
   *
   * NOTE: should we add a way to collect the `plafond` field?
   */
  getAllAidesIn(localisation: Localisation): AideVeloNonCalculee[] {
    const isLocalisationEqual = (
      key: keyof Localisation,
      collectivity: Collectivite,
    ): boolean => {
      return localisation[key] && localisation[key] === collectivity.value;
    };

    return this.engine
      .getAllAidesIn()
      .filter(({ id, collectivity }) => {
        if (AIDES_TO_EXCLUDE.includes(id)) {
          return false;
        }

        switch (collectivity.kind) {
          case 'pays': {
            return isLocalisationEqual('localisation . pays', collectivity);
          }
          case 'département': {
            return isLocalisationEqual(
              'localisation . département',
              collectivity,
            );
          }
          case 'région': {
            return isLocalisationEqual('localisation . région', collectivity);
          }
          case 'epci': {
            return isLocalisationEqual('localisation . epci', collectivity);
          }
          case 'code insee': {
            return isLocalisationEqual(
              'localisation . code insee',
              collectivity,
            );
          }
        }
      })
      .map((aide) => ({
        libelle: aide.title,
        lien: aide.url,
        collectivite: aide.collectivity,
        description: getDescription(aide.description),
        logo: getLogo(aide.id as string),
      }));
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
        .map((aide: Aide) => ({
          libelle: aide.title,
          montant: aide.amount,
          description: getDescription(aide.description),
          lien: aide.url,
          collectivite: aide.collectivity,
          logo: getLogo(aide.id as string),
          // NOTE: this is legacy behavior, the plafond is the same as the
          // amount we should consider removing this field or implementing it
          // correctly.
          // NOTE: after checking, it seems that the plafond is only used for
          // the aides retrofits repository, they shouldn't share the same type
          // or it should be refactored to have a generic type.
          plafond: aide.amount,
        }));
    }

    return veloTypes;
  }
}

function getLogo(id: string): string {
  return `${App.getAideVeloMiniaturesURL()}/${miniatures[id]}`;
}

function getDescription(description: string): string {
  return description.trim();
}
