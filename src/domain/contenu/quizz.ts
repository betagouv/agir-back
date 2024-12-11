import { Tag } from '../scoring/tag';
import { TaggedContent } from '../scoring/taggedContent';
import { TagRubrique } from '../scoring/tagRubrique';
import { QuizzDefinition } from './quizzDefinition';

export class Quizz extends QuizzDefinition implements TaggedContent {
  tags_rubriques: TagRubrique[];
  score: number;

  constructor(data: QuizzDefinition) {
    super();
    Object.assign(this, data);

    this.score = 0;

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
    return this.codes_postaux && this.codes_postaux.length > 0;
  }
}
