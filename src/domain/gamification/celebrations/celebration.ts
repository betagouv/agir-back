import { v4 as uuidv4 } from 'uuid';

export enum CelebrationType {
  niveau = 'niveau',
}

export class Celebration {
  constructor(type: CelebrationType) {
    this.id = uuidv4();
    this.type = type;
  }
  id: string;
  type: CelebrationType;
  titre: string;
}
