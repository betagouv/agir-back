import { Celebration_v0 } from '../../../../src/domain/object_store/gamification/gamification_v0';
import { v4 as uuidv4 } from 'uuid';
import { Reveal } from './reveal';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';

export enum CelebrationType {
  niveau = 'niveau',
  fin_mission = 'fin_mission',
  fin_thematique = 'fin_thematique',
}

export class Celebration {
  id: string;
  type: CelebrationType;
  titre: string;
  reveal?: Reveal;
  new_niveau?: number;
  new_thematiques?: ThematiqueUnivers[];
  thematique_univers?: ThematiqueUnivers;

  constructor(data: Celebration_v0) {
    this.id = data.id ? data.id : uuidv4();
    this.type = data.type;
    this.titre = data.titre;
    this.new_niveau = data.new_niveau;
    this.reveal = data.reveal ? new Reveal(data.reveal) : undefined;
    this.new_thematiques = data.new_thematiques;
    this.thematique_univers = data.thematique_univers;
  }

  public hasReveal?(): boolean {
    return !!this.reveal;
  }

  public getReveal?(): Reveal {
    return this.reveal;
  }
}
