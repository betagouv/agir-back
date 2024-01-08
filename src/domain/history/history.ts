import { ArticleHistory } from './articleHistory';

export class History {
  constructor(data: History) {
    this.article_interactions = [];

    if (data.article_interactions) {
      data.article_interactions.forEach((articleh) =>
        this.article_interactions.push(new ArticleHistory(articleh)),
      );
    }
  }

  article_interactions?: ArticleHistory[];

  public static newHistory(): History {
    return new History({});
  }
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

  public metPointsArticleEnPoche?(content_id: string) {
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
      result = new ArticleHistory({ content_id: content_id });
      this.article_interactions.push(result);
    }
    return result;
  }
}
