import { InteractionPlacement } from './interactionPosition';

export class InteractionDistribution {
  constructor(
    public prefered: number,
    public placement: InteractionPlacement,
    public min?: number,
    public max?: number,
    public positions?: number[],
  ) {}
}
