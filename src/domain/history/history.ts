import { ArticleHistory } from './articleHistory';

export class History {
  constructor(data?: History) {
    if (!data) data = {};

    Object.assign(this, data);
    if (data.article_interactions === undefined) {
      this.article_interactions = [];
    }
  }

  article_interactions?: ArticleHistory[];

  public getArticleHistoryById?(content_id: string) {
    return this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
  }

  public nombreArticles?() {
    return this.article_interactions.length;
  }
  public articleLu?(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.read_date = new Date();
  }

  public pointsArticleSontEnPoche?(content_id: string) {
    let article = this.findOrCreateArticleById(content_id);
    article.points_en_poche = true;
  }

  public likerArticle?(content_id: string, level: number) {
    let article = this.findOrCreateArticleById(content_id);
    article.like_level = level;
  }

  private findOrCreateArticleById?(content_id: string) {
    let result = this.article_interactions.find(
      (article) => article.content_id === content_id,
    );
    if (result) {
      return result;
    } else {
      result = new ArticleHistory();
      result.content_id = content_id;
      this.article_interactions.push(result);
    }
    return result;
  }
}
