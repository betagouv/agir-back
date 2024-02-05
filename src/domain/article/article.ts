import { DifficultyLevel } from '../contenu/difficultyLevel';
import { ArticleHistory } from '../history/articleHistory';
import { Thematique } from '../contenu/thematique';

export class Article {
  content_id: string;
  titre: string;
  soustitre?: string;
  source?: string;
  image_url: string;
  partenaire?: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree?: string;
  frequence?: string;
  difficulty: DifficultyLevel;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
}

export class PersonalArticle extends Article {
  constructor(article: Article, articleHistory?: ArticleHistory) {
    super();
    Object.assign(this, article);
    if (articleHistory) {
      this.favoris = articleHistory.favoris;
      this.read_date = articleHistory.read_date;
      this.like_level = articleHistory.like_level;
    } else {
      this.favoris = false;
      this.read_date = null;
      this.like_level = null;
    }
  }
  favoris: boolean;
  read_date?: Date;
  like_level?: number;
}
