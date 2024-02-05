import { Thematique } from './thematique';
import { ContentType } from './contentType';

export type ThematiqueFilter = {
  selected: boolean;
};
export class ContenuBibliotheque {
  content_id: string;
  type: ContentType;
  titre: string;
  soustitre?: string;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  duree?: string;
  image_url: string;
  points: number;
  favoris: boolean;
  like_level?: number;
  read_date?: Date;
}

export class Bibliotheque {
  constructor() {
    this.contenu = [];
    this.filtre_thematiques = new Map();
  }

  contenu: ContenuBibliotheque[];
  filtre_thematiques: Map<Thematique, ThematiqueFilter>;

  public addSelectedThematique(thematique: Thematique, selected: boolean) {
    this.filtre_thematiques.set(thematique, {
      selected: selected,
    });
  }
}
