import { DifficultyLevel } from './difficultyLevel';
import { ArticleHistory } from '../history/articleHistory';
import { Thematique } from './thematique';
import { TagUtilisateur } from '../scoring/tagUtilisateur';
import { TagRubrique } from '../scoring/tagRubrique';
import { TaggedContent } from '../scoring/taggedContent';
import { Tag } from '../scoring/tag';
import { Categorie } from './categorie';

export class ArticleData {
  content_id: string;
  titre: string;
  soustitre: string;
  source: string;
  image_url: string;
  partenaire: string;
  rubrique_ids: string[];
  rubrique_labels: string[];
  codes_postaux: string[];
  duree: string;
  frequence: string;
  difficulty: DifficultyLevel;
  points: number;
  thematique_principale: Thematique;
  thematiques: Thematique[];
  tags_utilisateur: TagUtilisateur[];
  tags_rubriques: TagRubrique[];
  score: number;
  categorie: Categorie;
  mois: number[];
}

export class Article extends ArticleData implements TaggedContent {
  constructor(data: ArticleData) {
    super();
    Object.assign(this, data);
    if (!this.score) {
      this.score = 0;
    }
    if (!this.mois) {
      this.mois = [];
    }
    if (this.rubrique_ids) {
      this.tags_rubriques = this.rubrique_ids.map((r) => TagRubrique[`R${r}`]);
    } else {
      this.tags_rubriques = [];
    }
  }
  public getTags(): Tag[] {
    return [].concat(
      this.thematiques,
      this.tags_utilisateur,
      this.tags_rubriques,
    );
  }

  public getDistinctText(): string {
    return this.titre;
  }
}

export class PersonalArticle extends Article {
  favoris: boolean;
  read_date?: Date;
  like_level?: number;

  constructor(article: Article, articleHistory?: ArticleHistory) {
    super(article);
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
}
