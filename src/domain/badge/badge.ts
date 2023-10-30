export class BadgeData {
  titre: string;
  type: string;
  created_at?: Date;
}

export class Badge extends BadgeData {
  constructor(data: BadgeData) {
    super();
    Object.assign(this, data);
  }
}
