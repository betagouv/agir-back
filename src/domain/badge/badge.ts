export type BadgeData = {
  titre: string;
  type: string;
  created_at: Date;
};

export class Badge {
  titre: string;
  type: string;
  created_at?: Date;

  constructor(data: BadgeData) {
    this.titre = data.titre;
    this.type = data.type;
    this.created_at = data.created_at;
  }
}
