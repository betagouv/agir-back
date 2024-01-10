import { ArticleHistory } from './articleHistory';
import { QuizzHistory } from './quizzHistory';

export class History {
  constructor(data: History) {
    this.article_interactions = [];
    this.quizz_interactions = [];

    if (data.article_interactions) {
      data.article_interactions.forEach((articleh) =>
        this.article_interactions.push(new ArticleHistory(articleh)),
      );
    }
    if (data.quizz_interactions) {
      data.quizz_interactions.forEach((quizzh) =>
        this.quizz_interactions.push(new QuizzHistory(quizzh)),
      );
    }
  }

  article_interactions?: ArticleHistory[];
  quizz_interactions?: QuizzHistory[];

  public static newHistory(): History {
    return new History({});
  }
  public getArticleHistoryById?(content_id: string) {
    return this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
  }
  public getQuizzHistoryById?(content_id: string) {
    return this.quizz_interactions.find(
      (quizz) => quizz.content_id === content_id,
    );
  }

  public nombreArticles?() {
    return this.article_interactions.length;
  }
  public listeIdsArticlesLus?() {
    return this.article_interactions
      .filter((article) => !!article.read_date)
      .map((article) => article.content_id);
  }
  public nombreQuizz?() {
    return this.quizz_interactions.length;
  }
  public articleLu?(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.read_date = new Date();
  }
  public quizzAttempt?(content_id: string, score: number) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.addAttempt(score);
  }

  public sontPointsArticleEnPoche?(content_id: string): boolean {
    let article = this.getArticleHistoryById(content_id);
    return article && article.points_en_poche;
  }
  public sontPointsQuizzEnPoche?(content_id: string): boolean {
    let quizz = this.getQuizzHistoryById(content_id);
    return quizz && quizz.points_en_poche;
  }
  public metPointsArticleEnPoche?(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.points_en_poche = true;
  }
  public metPointsQuizzEnPoche?(content_id: string) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.points_en_poche = true;
  }

  public likerArticle?(content_id: string, level: number) {
    let article = this.findOrCreateArticleById(content_id);
    article.like_level = level;
  }
  public likerQuizz?(content_id: string, level: number) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.like_level = level;
  }

  private findOrCreateArticleById?(content_id: string) {
    let result = this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
    if (result) {
      return result;
    } else {
      result = new ArticleHistory({ content_id: content_id });
      this.article_interactions.push(result);
    }
    return result;
  }
  private findOrCreateQuizzById?(content_id: string) {
    let result = this.quizz_interactions.find(
      (quizz) => quizz.content_id === content_id,
    );
    if (result) {
      return result;
    } else {
      result = new QuizzHistory({ content_id: content_id });
      this.quizz_interactions.push(result);
    }
    return result;
  }
}
