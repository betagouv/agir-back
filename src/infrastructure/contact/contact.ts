import { Utilisateur } from '../../domain/utilisateur/utilisateur';

export class Contact {
  attributes: {
    POINTS: number;
    EMAIL: string;
    NIVEAU: number;
    CODE_POSTAL: string;
    DERNIERE_ACTIVITE: Date;
    FIRSTNAME: string;
    LASTNAME: string;
  };
  email: string;
  ext_id?: string;
  emailBlacklisted?: boolean;
  smtpBlacklistSender?: [];
  smsBlacklisted?: boolean;
  listIds?: number[];
  unlinkListIds?: number[];

  constructor(contact?: Contact) {
    if (contact) {
      Object.assign(this, contact);
    }
  }

  public static newContactFromUser(user: Utilisateur): Contact {
    const result = new Contact();
    result.attributes = {
      POINTS: user.gamification.points,
      EMAIL: user.email,
      CODE_POSTAL: user.logement.code_postal,
      DERNIERE_ACTIVITE: user.derniere_activite,
      NIVEAU: user.gamification.getNiveau(),
      FIRSTNAME: user.prenom,
      LASTNAME: user.nom,
    };
    result.email = user.email;
    result.ext_id = user.id;
    result.emailBlacklisted = false;
    result.smtpBlacklistSender = [];
    result.smsBlacklisted = false;

    return result;
  }
}
