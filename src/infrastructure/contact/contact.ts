import { Utilisateur } from '../../domain/utilisateur/utilisateur';

export class Contact {
  attributes: {
    POINTS: number;
    EMAIL: string;
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

  public static buildContactFromUtilisateur(user: Utilisateur): Contact {
    const result = new Contact();
    result.attributes = {
      POINTS: user.gamification.getPoints(),
      EMAIL: user.email,
      CODE_POSTAL: user.logement.code_postal,
      DERNIERE_ACTIVITE: user.derniere_activite,
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
  public static newContactFromEmail(
    email: string,
    utilisateurId: string,
  ): Contact {
    const result = new Contact();
    result.attributes = {
      POINTS: 0,
      EMAIL: email,
      CODE_POSTAL: null,
      DERNIERE_ACTIVITE: null,
      FIRSTNAME: null,
      LASTNAME: null,
    };
    result.email = email;
    result.ext_id = utilisateurId;
    result.emailBlacklisted = false;
    result.smtpBlacklistSender = [];
    result.smsBlacklisted = false;

    return result;
  }
}
