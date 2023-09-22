import { Decimal } from '@prisma/client/runtime/library';
import { Thematique } from '../thematique';
import { DifficultyLevel } from '../difficultyLevel';
import { InteractionStatus } from './interactionStatus';
import { InteractionType } from './interactionType';
import { InteractionDefinition } from './interactionDefinition';

export class Interaction {
  constructor(data: object) {
    Object.assign(this, data);
  }

  id: string;
  content_id: string;
  type: InteractionType;
  titre: string;
  soustitre: string;
  thematique_gamification: Thematique;
  thematiques: Thematique[];
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
  difficulty: DifficultyLevel;
  points: number;
  quizz_score: number;
  score: Decimal;
  locked: boolean;
  pinned_at_position: number;
  raison_lock: string;
  scheduled_reset: Date;
  day_period: number;
  codes_postaux: string[];
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
    if (status.quizz_score) {
      this.done = true;
      this.quizz_score = status.quizz_score;
    }
  }

  public static newDefaultInteractionFromDefinition(
    interactionDefinition: InteractionDefinition,
  ) {
    let result = new Interaction(interactionDefinition);
    result.score = new Decimal('0.5');
    return result;
  }
}
