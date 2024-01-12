export class QuizzAttempt {
  constructor(score: number, date: Date) {
    this.score = score;
    this.date = date;
  }
  score: number;
  date: Date;
}

export class QuizzHistory {
  constructor(data: QuizzHistory) {
    this.content_id = data.content_id;
    this.attempts = [];
    if (data.attempts) {
      data.attempts.forEach((attempt) => {
        this.attempts.push(
          new QuizzAttempt(attempt.score, new Date(attempt.date)),
        );
      });
    }
    this.like_level = data.like_level;
    this.points_en_poche = data.points_en_poche ? data.points_en_poche : false;
  }

  content_id: string;
  attempts?: QuizzAttempt[];
  like_level?: number;
  points_en_poche?: boolean;

  public addAttempt?(score: number, date?: Date) {
    this.attempts.push(new QuizzAttempt(score, date || new Date()));
  }

  public has100ScoreAmongAttempts?(): boolean {
    return this.attempts.findIndex((attempt) => attempt.score === 100) >= 0;
  }
  public hasAttempt?(): boolean {
    return this.attempts.length > 0;
  }
}
