import { UtilisateurData } from '../../domain/utilisateur/utilisateur';

export class Contact {
  attributes: {
    POINTS: number;
    EMAIL: string;
  };
  email: string;
  ext_id?: string;
  emailBlacklisted?: boolean;
  smtpBlacklistSender?: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  unlinkListIds?: number[];

  constructor(data: UtilisateurData) {
    this.attributes = {
      POINTS: data.gamification.points,
      EMAIL: data.email,
    };
    this.email = data.email;
    this.ext_id = data.id;
    this.emailBlacklisted = false;
    this.smtpBlacklistSender = false;
    this.smsBlacklisted = false;
  }
}
