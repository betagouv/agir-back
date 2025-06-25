import { Thematique } from './thematique';

export enum SousThematique {
  logement_economie_energie = 'logement_economie_energie',
  logement_risque_naturel = 'logement_risque_naturel',
}

export class SousThematiqueHelper {
  public static getThematique(sous: SousThematique): Thematique {
    for (const them of Object.values(Thematique)) {
      if (sous.startsWith(them)) {
        return them;
      }
    }
    return undefined;
  }
}

// Convention de nommage de préfixer par le code thematique
