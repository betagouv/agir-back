import { Article } from '../article/article';
import { Quizz } from '../quizz/quizz';

export type ScoredContent = {
  score: number;
  content_id: string;
};
export class ContentRecommandation {
  content_scores: ScoredContent[];

  constructor() {
    this.content_scores = [];
  }

  public append(score: number, content_id: string) {
    this.content_scores.push({ score, content_id });
  }

  public filterAndOrderArticlesOrQuizzes(
    content_list: (Article | Quizz)[],
  ): (Article | Quizz)[] {
    const result: Article[] = [];
    this.content_scores.forEach((reco) => {
      const found_article = this.getContentOfContentId(
        content_list,
        reco.content_id,
      );
      if (found_article) result.push(found_article);
    });
    return result;
  }

  public affectScores(content_liste: ScoredContent[]) {
    const content_scores_working_liste = [...this.content_scores];
    content_liste.forEach((content) => {
      const index = content_scores_working_liste.findIndex(
        (e) => e.content_id === content.content_id,
      );
      if (index === -1) {
        content.score = 0;
      } else {
        content.score = content_scores_working_liste[index].score;
        content_scores_working_liste.splice(index, 1);
      }
    });
  }

  private getContentOfContentId(
    contents: (Article | Quizz)[],
    content_id: string,
  ): Article | Quizz {
    return contents.find((content) => content.content_id === content_id);
  }
}
