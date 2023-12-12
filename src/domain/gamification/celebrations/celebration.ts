import { v4 as uuidv4 } from 'uuid';
import { Reveal } from './reveal';

export enum CelebrationType {
  niveau = 'niveau',
}

export class CelebrationData {
  id: string;
  type: CelebrationType;
  titre: string;
  reveal?: Reveal;
  new_niveau?: number;
}

export class Celebration extends CelebrationData {
  constructor(data: CelebrationData) {
    super();
    Object.assign(this, data);
    this.id = data.id ? data.id : uuidv4();
  }

  public hasReveal?(): boolean {
    return !!this.reveal;
  }

  public getReveal?(): Reveal {
    return this.reveal;
  }
}
