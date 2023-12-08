import { Celebration, CelebrationType } from './celebration';

export class CelebrationDeNiveau extends Celebration {
  constructor(new_niveau: number) {
    super(CelebrationType.niveau);
    this.new_niveau = new_niveau;
    this.titre = `Bravo ! grâce à vos points récoltés vous passez au niveau ${new_niveau} !`;
  }
  new_niveau: number;
}
