import { Utilisateur } from '../../domain/utilisateur/utilisateur';

export class Contact {
  attributes: {
    POINTS: number;
    EMAIL: string;
    NIVEAU: number;
    CODE_POSTAL: string;
    DERNIERE_ACTIVITE: Date;
  };
  email: string;
  ext_id?: string;
  emailBlacklisted?: boolean;
  smtpBlacklistSender?: [];
  smsBlacklisted?: boolean;
  listIds?: number[];
  unlinkListIds?: number[];

  constructor(user: Utilisateur) {
    this.attributes = {
      POINTS: user.gamification.points,
      EMAIL: user.email,
      CODE_POSTAL: user.logement.code_postal,
      DERNIERE_ACTIVITE: user.derniere_activite,
      NIVEAU: user.gamification.getNiveau(),
    };
    this.email = user.email;
    this.ext_id = user.id;
    this.emailBlacklisted = false;
    this.smtpBlacklistSender = [];
    this.smsBlacklisted = false;
  }
}
