import { ExplicationScore } from '../scoring/system_v2/ExplicationScore';
import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { TagRubrique } from '../scoring/tagRubrique';
import { Thematique } from '../thematique/thematique';
import { ArticleDefinition } from './articleDefinition';
import { QuizzDefinition } from './quizzDefinition';

export class Quizz extends QuizzDefinition implements TaggedContent {
  tags_rubriques: TagRubrique[];
  score: number;
  explicationScore: ExplicationScore;
  article?: ArticleDefinition;
  premier_coup_ok?: boolean;
  date_premier_coup?: Date;
  like_level?: number;
  nombre_tentatives?: number;

  constructor(data: QuizzDefinition) {
    super();
    Object.assign(this, data);

    this.score = 0;
    this.explicationScore = new ExplicationScore();

    if (!this.mois) {
      this.mois = [];
    }

    // FIXME : passer en codes côté CMS avec correspondance directe
    if (this.rubrique_ids) {
      this.tags_rubriques = this.rubrique_ids.map((r) => TagRubrique[`R${r}`]);
    } else {
      this.tags_rubriques = [];
    }
  }

  public getThematiques(): Thematique[] {
    return this.thematiques;
  }

  public getTags(): Tag[] {
    return [].concat(
      this.thematiques,
      this.tags_utilisateur,
      this.tags_rubriques,
    );
  }

  public getInclusionTags(): string[] {
    return [];
  }
  public getExclusionTags(): string[] {
    return [];
  }

  public getDistinctText(): string {
    return this.titre;
  }

  public isLocal(): boolean {
    return this.codes_postaux && this.codes_postaux.length > 0;
  }
}
