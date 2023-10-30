import { Decimal } from '@prisma/client/runtime/library';

export class InteractionScore {
  // FIXME : change from Decimal to number
  constructor(id: string, score: Decimal) {
    this.score = score;
    this.id = id;
  }

  id: string;
  score: Decimal;

  public upScore(value: Decimal) {
    // 1-(1-score)/value
    this.score = new Decimal(1).minus(
      new Decimal(1).minus(this.score).dividedBy(value),
    );
  }
  public downScore(value: Decimal) {
    // score/value
    this.score = this.score.dividedBy(value);
  }
}
