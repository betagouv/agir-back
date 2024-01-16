import { UtilisateurData } from '../utilisateur/utilisateur';

export class ContactData {
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
}

// construct contact from utilisateur
export class Contact extends ContactData {
  constructor(data: UtilisateurData) {
    super();
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
