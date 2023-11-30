export enum CelebrationType {
  niveau = 'niveau',
}

export class Celebration {
  id: string;
  type: CelebrationType;
  new_niveau?: number;
}
