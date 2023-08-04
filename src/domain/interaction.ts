import { InteractionStatus } from './interactionStatus';

export class Interaction {
  constructor(data: object) {
    Object.assign(this, data);
  }

  id: string;
  content_id: string;
  type: string;
  titre: string;
  soustitre: string;
  categorie: string;
  tags: [];
  duree: string;
  frequence: string;
  image_url: string;
  url: string;
  seen: number;
  seen_at: Date;
  clicked: boolean;
  clicked_at: Date;
  done: boolean;
  done_at: Date;
  succeeded: boolean;
  succeeded_at: Date;
  difficulty: number;
  points: number;
  reco_score: number;
  locked: boolean;
  scheduled_reset: Date;
  day_period: number;
  utilisateurId: string;
  created_at: Date;
  updated_at: Date;

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
    if (status.seen && status.seen !== this.seen) {
      this.seen = status.seen;
      this.seen_at = new Date();
    }
    if (status.done && !this.done) {
      this.done = true;
      this.done_at = new Date();
    }
    if (status.clicked && !this.clicked) {
      this.clicked = true;
      this.clicked_at = new Date();
    }
    if (status.succeeded && !this.succeeded) {
      this.succeeded = true;
      this.succeeded_at = new Date();
    }
  }
}
