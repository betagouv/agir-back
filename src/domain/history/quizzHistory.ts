import {
  QuizzAttempt_v0,
  QuizzHistory_v0,
} from '../object_store/history/history_v0';

export class QuizzAttempt {
  score: number;
  date: Date;

  constructor(data: QuizzAttempt_v0) {
    this.score = data.score;
    this.date = data.date;
  }
}

export class QuizzHistory {
  content_id: string;
  attempts?: QuizzAttempt[];
  like_level?: number;
  points_en_poche: boolean;

  constructor(data?: QuizzHistory_v0) {
    this.attempts = [];
    if (data) {
      this.content_id = data.content_id;
      this.like_level = data.like_level;
      this.points_en_poche = data.points_en_poche
        ? data.points_en_poche
        : false;
      if (data.attempts) {
        data.attempts.forEach((attempt) => {
          this.attempts.push(new QuizzAttempt(attempt));
        });
      }
    }
  }

  public addAttempt(score: number, date?: Date) {
    this.attempts.push(
      new QuizzAttempt({ score: score, date: date || new Date() }),
    );
  }

  public getNombreEssais(): number {
    return this.attempts ? this.attempts.length : 0;
  }

  public has100ScoreAmongAttempts(): boolean {
    return this.attempts.findIndex((attempt) => attempt.score === 100) >= 0;
  }
  public has100ScoreFirstAttempt(): boolean {
    if (this.attempts.length === 0) return false;
    return this.attempts[0].score === 100;
  }
  public getDateFirstAttempt(): Date {
    if (this.attempts.length === 0) return undefined;
    return this.attempts[0].date;
  }
  public has100ScoreLastAttempt(): boolean {
    if (this.attempts.length === 0) return false;
    return this.attempts[this.attempts.length - 1].score === 100;
  }
  public has0ScoreAmongAttempts(): boolean {
    return this.attempts.findIndex((attempt) => attempt.score === 0) >= 0;
  }
  public hasAttempt(): boolean {
    return this.attempts.length > 0;
  }
}
