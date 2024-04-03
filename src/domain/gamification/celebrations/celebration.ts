import { Celebration_v0 } from '../../../../src/domain/object_store/gamification/gamification_v0';
import { v4 as uuidv4 } from 'uuid';
import { Reveal } from './reveal';

export enum CelebrationType {
  niveau = 'niveau',
  fin_mission = 'fin_mission',
}

export class Celebration {
  id: string;
  type: CelebrationType;
  titre: string;
  reveal?: Reveal;
  new_niveau?: number;

  constructor(data: Celebration_v0) {
    this.id = data.id ? data.id : uuidv4();
    this.type = data.type;
    this.titre = data.titre;
    this.new_niveau = data.new_niveau;
    this.reveal = data.reveal ? new Reveal(data.reveal) : undefined;
  }

  public hasReveal?(): boolean {
    return !!this.reveal;
  }

  public getReveal?(): Reveal {
    return this.reveal;
  }
}
