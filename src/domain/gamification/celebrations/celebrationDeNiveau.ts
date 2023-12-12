import { Feature } from '../feature';
import { Celebration, CelebrationType } from './celebration';
import { Reveal } from './reveal';
import { v4 as uuidv4 } from 'uuid';

export class CelebrationDeNiveau extends Celebration {
  constructor(new_niveau: number) {
    super({
      new_niveau: new_niveau,
      type: CelebrationType.niveau,
      id: uuidv4(),
      titre: `Bravo ! grâce à vos points récoltés vous passez au niveau ${new_niveau} !`,
    });
    switch (new_niveau) {
      case 2:
        this.reveal = new Reveal(Feature.services);
        break;
      case 3:
        this.reveal = new Reveal(Feature.aides);
        break;
      case 4:
        this.reveal = new Reveal(Feature.recommendations);
        break;
    }
  }
}
