import { ThematiqueFilter } from '../contenu/bibliotheque';
import { Thematique } from '../thematique/thematique';
import { Action } from './action';

export enum Consultation {
  vu = 'vu',
  pas_vu = 'pas_vu',
  tout = 'tout',
}
export enum Realisation {
  faite = 'faite',
  pas_faite = 'pas_faite',
  tout = 'tout',
}

export class CatalogueAction {
  actions: Action[];
  filtre_thematiques: Map<Thematique, ThematiqueFilter>;
  consultation: Consultation;
  realisation: Realisation;

  constructor() {
    this.actions = [];
    this.filtre_thematiques = new Map();
    this.consultation = Consultation.tout;
    this.realisation = Realisation.tout;
  }

  public addSelectedThematique(thematique: Thematique, selected: boolean) {
    this.filtre_thematiques.set(thematique, {
      selected: selected,
    });
  }
}
