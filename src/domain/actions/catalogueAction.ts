import { ThematiqueFilter } from '../contenu/bibliotheque';
import { Thematique } from '../thematique/thematique';
import { Action } from './action';

export class CatalogueAction {
  actions: Action[];
  filtre_thematiques: Map<Thematique, ThematiqueFilter>;

  constructor() {
    this.actions = [];
    this.filtre_thematiques = new Map();
  }

  public addSelectedThematique(thematique: Thematique, selected: boolean) {
    this.filtre_thematiques.set(thematique, {
      selected: selected,
    });
  }
}
