import { Article } from './article';
import { Quizz } from './quizz/quizz';

export class ContentRecommandation {
  liste: { score: number; content_id: string }[];

  constructor() {
    this.liste = [];
  }

  public append(score: number, content_id: string) {
    this.liste.push({ score, content_id });
  }

  public filterAndOrderArticlesOrQuizzes(
    contents: (Article | Quizz)[],
  ): (Article | Quizz)[] {
    const result: Article[] = [];
    this.liste.forEach((reco) => {
      const found_article = this.getContentOfContentId(
        contents,
        reco.content_id,
      );
      if (found_article) result.push(found_article);
    });
    return result;
  }

  private getContentOfContentId(
    contents: (Article | Quizz)[],
    content_id: string,
  ): Article | Quizz {
    return contents.find((content) => content.content_id === content_id);
  }
}
