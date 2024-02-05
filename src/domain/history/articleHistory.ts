export class ArticleHistoryData {
  content_id: string;
  read_date?: Date;
  like_level?: number;
  points_en_poche: boolean;
  favoris: boolean;
}

export class ArticleHistory extends ArticleHistoryData {
  constructor(data: ArticleHistoryData) {
    super();
    this.content_id = data.content_id;
    this.read_date = data.read_date ? new Date(data.read_date) : undefined;
    this.like_level = data.like_level;
    this.points_en_poche = data.points_en_poche ? data.points_en_poche : false;
    this.favoris = data.favoris ? data.favoris : false;
  }
}
