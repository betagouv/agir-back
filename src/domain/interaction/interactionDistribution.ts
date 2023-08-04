import { InteractionPosition } from './interactionPosition';
import { InteractionType } from './interactionType';

export class InteractionDistribution {
  constructor() {}

  type: InteractionType;
  prefered: number;
  min: number;
  max: number;
  position: InteractionPosition;
}
