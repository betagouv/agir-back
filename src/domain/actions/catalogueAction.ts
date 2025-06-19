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

export enum Ordre {
  random = 'random',
  recommandee = 'recommandee',
  recommandee_filtre_perso = 'recommandee_filtre_perso',
}

export class CatalogueAction {
  actions: Action[];
  filtre_thematiques: Map<Thematique, ThematiqueFilter>;
  consultation: Consultation;
  realisation: Realisation;
  ordre: Ordre;
  nombre_resultats_disponibles: number;

  constructor() {
    this.actions = [];
    this.filtre_thematiques = new Map();
    this.consultation = Consultation.tout;
    this.realisation = Realisation.tout;
    this.nombre_resultats_disponibles = 0;
  }
  public getNombreResultats(): number {
    return this.actions.length;
  }
  public getNombreResultatsDispo(): number {
    return this.nombre_resultats_disponibles;
  }
  public setNombreResultatsDispo(total: number) {
    this.nombre_resultats_disponibles = total;
  }

  public addSelectedThematique(thematique: Thematique, selected: boolean) {
    this.filtre_thematiques.set(thematique, {
      selected: selected,
    });
  }
}
