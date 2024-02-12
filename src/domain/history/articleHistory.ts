import { ArticleHistory_v0 } from '../object_store/history/history_v0';

export class ArticleHistory {
  content_id: string;
  read_date?: Date;
  like_level?: number;
  points_en_poche: boolean;
  favoris: boolean;
  constructor(data: ArticleHistory_v0) {
    this.content_id = data.content_id;
    this.read_date = data.read_date;
    this.like_level = data.like_level;
    this.points_en_poche = data.points_en_poche ? data.points_en_poche : false;
    this.favoris = data.favoris ? data.favoris : false;
  }
}
