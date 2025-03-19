import { Utilisateur } from '../utilisateur/utilisateur';
import { EmailNotification } from './notificationHistory';
import { NotificationScheduler } from './notificationScheduler';

const minute_10 = 10 * 60 * 1000;
const jour_1 = 24 * 60 * 60 * 1000;
const jour_2 = jour_1 * 2;
const jour_8 = jour_1 * 8;
const jour_10 = jour_1 * 10;
const jour_30 = jour_1 * 30;

export class EmailScheduler extends NotificationScheduler {
  public static estNotificationEligible(
    notif: EmailNotification,
    utilisateur: Utilisateur,
  ): boolean {
    if (notif === EmailNotification.waiting_action) {
      const plus_vieux_defi_encours =
        utilisateur.defi_history.getPlusVieuxDefiEnCours();

      return (
        utilisateur.active_account &&
        this.not_sent(notif, utilisateur) &&
        plus_vieux_defi_encours &&
        Date.now() - plus_vieux_defi_encours.date_acceptation.getTime() >
          jour_10
      );
    }
    if (notif === EmailNotification.welcome) {
      const age = this.getAgeCreationUtilisateur(utilisateur);
      return (
        this.not_sent(notif, utilisateur) &&
        age > minute_10 &&
        age < jour_30 &&
        utilisateur.active_account
      );
    }

    return false;
  }
}
