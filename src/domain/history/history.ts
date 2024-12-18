import { Article } from '../contenu/article';
import { ArticleDefinition } from '../contenu/articleDefinition';
import { Categorie } from '../contenu/categorie';
import { History_v0 } from '../object_store/history/history_v0';
import { AideHistory } from './aideHistory';
import { ArticleHistory } from './articleHistory';
import { QuizzHistory } from './quizzHistory';

export type SearchArticleFilter = {
  est_lu?: boolean;
  est_favoris?: boolean;
  categorie?: Categorie;
};

export class History {
  article_interactions: ArticleHistory[];
  quizz_interactions: QuizzHistory[];
  aide_interactions: AideHistory[];

  constructor(data?: History_v0) {
    this.reset();

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
      if (data.aide_interactions) {
        data.aide_interactions.forEach((aideH) =>
          this.aide_interactions.push(new AideHistory(aideH)),
        );
      }
    }
  }

  public reset() {
    this.article_interactions = [];
    this.quizz_interactions = [];
    this.aide_interactions = [];
  }

  public clickAideInfosLink(id_cms: string) {
    const interaction = this.getAideInteractionByIdCms(id_cms);
    if (interaction) {
      interaction.clicked_infos = true;
    } else {
      const new_interaction = new AideHistory({
        content_id: id_cms,
        clicked_infos: true,
        clicked_demande: false,
      });
      this.aide_interactions.push(new_interaction);
    }
  }
  public clickAideDemandeLink(id_cms: string) {
    const interaction = this.getAideInteractionByIdCms(id_cms);
    if (interaction) {
      interaction.clicked_demande = true;
    } else {
      const new_interaction = new AideHistory({
        content_id: id_cms,
        clicked_infos: false,
        clicked_demande: true,
      });
      this.aide_interactions.push(new_interaction);
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

  public getAideInteractionByIdCms(id_cms: string): AideHistory {
    return this.aide_interactions.find((a) => a.content_id === id_cms);
  }

  public nombreArticles(): number {
    return this.article_interactions.length;
  }

  public getArticleFromBibliotheque(
    article_definition: ArticleDefinition,
  ): Article {
    const article = new Article(article_definition);
    const found_article_history = this.getArticleHistoryById(
      article_definition.content_id,
    );
    if (found_article_history) {
      article.setHistory(found_article_history);
    }
    return article;
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
    articles_defs: ArticleDefinition[],
  ): Article[] {
    const articlesFavoris: Article[] = [];
    const articlesPasFavoris: Article[] = [];

    articles_defs.forEach((article_def) => {
      const perso = this.getArticleFromBibliotheque(article_def);
      if (perso.favoris) {
        articlesFavoris.push(perso);
      } else {
        articlesPasFavoris.push(perso);
      }
    });

    this.sortByDate(articlesFavoris);
    this.sortByDate(articlesPasFavoris);

    return [].concat(articlesFavoris, articlesPasFavoris);
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
    let quizz = this.findQuizzByIdOrCreate(content_id);
    quizz.addAttempt(score, date);
  }

  public estArticleLu(content_id: string): boolean {
    let article = this.getArticleHistoryById(content_id);
    if (article) {
      return !!article.read_date;
    }
    return false;
  }
  public estQuizzReussi(content_id: string): boolean {
    let quizz = this.getQuizzHistoryById(content_id);
    if (quizz) {
      return quizz.has100ScoreAmongAttempts();
    }
    return false;
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
    let quizz = this.findQuizzByIdOrCreate(content_id);
    quizz.points_en_poche = true;
  }

  public likerArticle(content_id: string, level: number) {
    let article = this.findOrCreateArticleById(content_id);
    article.like_level = level;
  }
  public likerQuizz(content_id: string, level: number) {
    let quizz = this.findQuizzByIdOrCreate(content_id);
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

  private sortByDate(articles: Article[]) {
    articles.sort((a, b) => b.read_date.getTime() - a.read_date.getTime());
  }

  private findQuizzByIdOrCreate(content_id: string): QuizzHistory {
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
