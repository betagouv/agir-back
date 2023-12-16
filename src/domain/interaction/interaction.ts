import { InteractionStatus } from './interactionStatus';
import { InteractionDefinition } from './interactionDefinition';

export class InteractionData extends InteractionDefinition {
  id: string;
  seen: number;
  seen_at: Date;
  clicked: boolean;
  clicked_at: Date;
  done: boolean;
  done_at: Date;
  quizz_score: number;
  score: number;
  like_level: number;
  scheduled_reset: Date;
  utilisateurId: string;

  constructor() {
    super({} as any);
  }
}

export class InteractionIdProjection {
  id: string;
  content_id: string;
}
export class Interaction extends InteractionData {
  constructor(data: InteractionData) {
    super();
    Object.assign(this, data);
  }

  public setNextScheduledReset(): Date {
    if (this.day_period) {
      this.scheduled_reset = new Date();
      this.scheduled_reset.setDate(
        this.scheduled_reset.getDate() + this.day_period,
      );
      this.scheduled_reset.setHours(0, 0, 0, 0);
      return this.scheduled_reset;
    }
    this.scheduled_reset = null;
    return null;
  }

  public updateStatus(status: InteractionStatus) {
    if (status.seen !== undefined) {
      this.seen = status.seen;
      this.seen_at = new Date();
    }
    if (status.done !== undefined) {
      this.done = true;
      this.done_at = new Date();
    }
    if (status.clicked !== undefined) {
      this.clicked = true;
      this.clicked_at = new Date();
    }
    if (status.quizz_score !== undefined) {
      this.done = true;
      this.quizz_score = status.quizz_score;
    }
  }

  public static newDefaultInteractionFromDefinition(
    interactionDefinition: InteractionDefinition,
  ): Interaction {
    return new Interaction({
      ...interactionDefinition,
      seen: 0,
      seen_at: null,
      clicked: false,
      clicked_at: null,
      done: false,
      done_at: null,
      quizz_score: null,
      scheduled_reset: null,
      utilisateurId: undefined,
      score: 0.5,
      like_level: null,
    });
  }
}
