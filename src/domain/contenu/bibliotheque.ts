import { SousThematique } from '../thematique/sousThematique';
import { Thematique } from '../thematique/thematique';
import { Article } from './article';
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
    this.filtre_sous_thematiques = new Map();
    this.nombre_resultats_dispo = 0;
  }

  private contenu: ContenuBibliotheque[];

  filtre_thematiques: Map<Thematique, ThematiqueFilter>;
  filtre_sous_thematiques: Map<SousThematique, ThematiqueFilter>;

  private nombre_resultats_dispo: number;

  public addSelectedThematique(thematique: Thematique, selected: boolean) {
    this.filtre_thematiques.set(thematique, {
      selected: selected,
    });
  }

  public getAllContenu(): ContenuBibliotheque[] {
    return this.contenu;
  }
  public getNombreResultats(): number {
    return this.contenu.length;
  }
  public getNombreResultatsDispo(): number {
    return this.nombre_resultats_dispo;
  }
  public setNombreResultatsDispo(total: number) {
    this.nombre_resultats_dispo = total;
  }

  public addArticles(articles: Article[]) {
    for (const article of articles) {
      this.contenu.push({ ...article, type: ContentType.article });
    }
  }
}
