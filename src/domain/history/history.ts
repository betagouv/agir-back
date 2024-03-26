import { Article, PersonalArticle } from '../contenu/article';
import { History_v0 } from '../object_store/history/history_v0';
import { ArticleHistory } from './articleHistory';
import { QuizzHistory } from './quizzHistory';

export type SearchArticleFilter = {
  est_lu?: boolean;
  est_favoris?: boolean;
};

export class History {
  article_interactions: ArticleHistory[];
  quizz_interactions: QuizzHistory[];

  constructor(data?: History_v0) {
    this.article_interactions = [];
    this.quizz_interactions = [];
    if (data) {
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
  }

  public getArticleHistoryById(content_id: string): ArticleHistory {
    return this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
  }
  public getQuizzHistoryById(content_id: string): QuizzHistory {
    return this.quizz_interactions.find(
      (quizz) => quizz.content_id === content_id,
    );
  }

  public nombreArticles(): number {
    return this.article_interactions.length;
  }

  public personnaliserArticle(article: Article): PersonalArticle {
    const found_article_history = this.getArticleHistoryById(
      article.content_id,
    );
    return new PersonalArticle(article, found_article_history);
  }

  public searchArticlesIds(filter: SearchArticleFilter): string[] {
    const filtered = this.article_interactions.filter((article) => {
      let select = true;
      if (filter.est_lu) {
        select = select && !!article.read_date;
      }
      if (filter.est_favoris) {
        select = select && article.favoris;
      }
      return select;
    });

    return filtered.map((article) => article.content_id);
  }

  public orderArticlesByReadDateAndFavoris(
    articles: Article[],
  ): PersonalArticle[] {
    const personalArticlesFavoris: PersonalArticle[] = [];
    const personalArticlesPasFavoris: PersonalArticle[] = [];

    articles.forEach((article) => {
      const perso = this.personnaliserArticle(article);
      if (perso.favoris) {
        personalArticlesFavoris.push(perso);
      } else {
        personalArticlesPasFavoris.push(perso);
      }
    });

    this.sortByDate(personalArticlesFavoris);
    this.sortByDate(personalArticlesPasFavoris);

    return [].concat(personalArticlesFavoris, personalArticlesPasFavoris);
  }

  public listeIdsQuizz100Pour100(): string[] {
    return this.quizz_interactions
      .filter((quizz) => quizz.has100ScoreAmongAttempts())
      .map((article) => article.content_id);
  }
  public listeIdsQuizzAttempted(): string[] {
    return this.quizz_interactions
      .filter((quizz) => quizz.hasAttempt())
      .map((article) => article.content_id);
  }
  public nombreQuizz(): number {
    return this.quizz_interactions.length;
  }
  public lireArticle(content_id: string, date?: Date) {
    let article = this.findOrCreateArticleById(content_id);
    article.read_date = date || new Date();
  }
  public quizzAttempt(content_id: string, score: number, date?: Date) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.addAttempt(score, date);
  }

  public sontPointsArticleEnPoche(content_id: string): boolean {
    let article = this.getArticleHistoryById(content_id);
    return article && article.points_en_poche;
  }
  public sontPointsQuizzEnPoche(content_id: string): boolean {
    let quizz = this.getQuizzHistoryById(content_id);
    return quizz && quizz.points_en_poche;
  }
  public declarePointsArticleEnPoche(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.points_en_poche = true;
  }
  public declarePointsQuizzEnPoche(content_id: string) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.points_en_poche = true;
  }

  public likerArticle(content_id: string, level: number) {
    let article = this.findOrCreateArticleById(content_id);
    article.like_level = level;
  }
  public likerQuizz(content_id: string, level: number) {
    let quizz = this.findOrCreateQuizzById(content_id);
    quizz.like_level = level;
  }
  public favoriserArticle(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.favoris = true;
  }

  public defavoriserArticle(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.favoris = false;
  }

  private findOrCreateArticleById(content_id: string): ArticleHistory {
    let result = this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
    if (result) {
      return result;
    } else {
      result = new ArticleHistory({
        content_id: content_id,
        favoris: false,
        points_en_poche: false,
      });
      this.article_interactions.push(result);
    }
    return result;
  }

  private sortByDate(articles: PersonalArticle[]) {
    articles.sort((a, b) => b.read_date.getTime() - a.read_date.getTime());
  }

  private findOrCreateQuizzById(content_id: string): QuizzHistory {
    let result = this.quizz_interactions.find(
      (quizz) => quizz.content_id === content_id,
    );
    if (result) {
      return result;
    } else {
      result = new QuizzHistory({
        content_id: content_id,
        attempts: [],
        points_en_poche: false,
      });
      this.quizz_interactions.push(result);
    }
    return result;
  }
}
