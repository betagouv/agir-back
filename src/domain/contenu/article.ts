import { ArticleHistory } from '../history/articleHistory';
import { TagRubrique } from '../scoring/tagRubrique';
import { TaggedContent } from '../scoring/taggedContent';
import { Tag } from '../scoring/tag';
import { ArticleDefinition } from './articleDefinition';

export class Article extends ArticleDefinition implements TaggedContent {
  tags_rubriques: TagRubrique[];
  score: number;
  favoris: boolean;
  read_date?: Date;
  like_level?: number;

  constructor(data: ArticleDefinition) {
    super();
    Object.assign(this, data);

    this.score = 0;
    this.favoris = false;
    this.read_date = null;
    this.like_level = null;

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

  public isLocal(): boolean {
    return (
      (this.codes_postaux && this.codes_postaux.length > 0) ||
      (this.include_codes_commune && this.include_codes_commune.length > 0) ||
      (this.codes_departement && this.codes_departement.length > 0) ||
      (this.codes_region && this.codes_region.length > 0)
    );
  }

  public setHistory(articleHistory: ArticleHistory): Article {
    this.favoris = articleHistory.favoris;
    this.read_date = articleHistory.read_date;
    this.like_level = articleHistory.like_level;
    return this;
  }
}
