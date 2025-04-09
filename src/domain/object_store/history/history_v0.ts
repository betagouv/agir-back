import { ArticleHistory } from '../../../../src/domain/history/articleHistory';
import { History } from '../../../../src/domain/history/history';
import {
  QuizzAttempt,
  QuizzHistory,
} from '../../../../src/domain/history/quizzHistory';
import { AideHistory } from '../../history/aideHistory';
import { Versioned_v0 } from '../versioned';

export class ArticleHistory_v0 {
  content_id: string;
  read_date?: Date;
  like_level?: number;
  favoris: boolean;

  static map(elem: ArticleHistory): ArticleHistory_v0 {
    return {
      content_id: elem.content_id,
      read_date: elem.read_date,
      like_level: elem.like_level,
      favoris: elem.favoris,
    };
  }
}

export class QuizzAttempt_v0 {
  score: number;
  date: Date;

  static map(elem: QuizzAttempt): QuizzAttempt_v0 {
    return {
      score: elem.score,
      date: elem.date,
    };
  }
}
export class AideHistory_v0 {
  content_id: string;
  vue_at: Date;
  clicked_infos: boolean;
  clicked_demande: boolean;

  static map(elem: AideHistory): AideHistory_v0 {
    return {
      content_id: elem.content_id,
      clicked_infos: elem.clicked_infos,
      clicked_demande: elem.clicked_demande,
      vue_at: elem.vue_at,
    };
  }
}
export class QuizzHistory_v0 {
  content_id: string;
  attempts: QuizzAttempt_v0[];
  like_level?: number;

  static map(elem: QuizzHistory): QuizzHistory_v0 {
    return {
      content_id: elem.content_id,
      attempts: elem.attempts.map((e) => QuizzAttempt_v0.map(e)),
      like_level: elem.like_level,
    };
  }
}

export class History_v0 extends Versioned_v0 {
  article_interactions: ArticleHistory_v0[];
  quizz_interactions: QuizzHistory_v0[];
  aide_interactions: AideHistory_v0[];

  constructor() {
    super();
    this.aide_interactions = [];
    this.article_interactions = [];
    this.quizz_interactions = [];
  }

  static serialise(domain: History): History_v0 {
    return {
      version: 0,
      article_interactions: domain.article_interactions.map((elem) =>
        ArticleHistory_v0.map(elem),
      ),
      quizz_interactions: domain.quizz_interactions.map((elem) =>
        QuizzHistory_v0.map(elem),
      ),
      aide_interactions: domain.aide_interactions.map((elem) =>
        AideHistory_v0.map(elem),
      ),
    };
  }
}
