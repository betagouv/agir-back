import { Utilisateur } from '../utilisateur/utilisateur';
import { MobileNotification } from './notificationHistory';
import { NotificationScheduler } from './notificationScheduler';

const minute_10 = 10 * 60 * 1000;
const jour_1 = 24 * 60 * 60 * 1000;
const jour_2 = jour_1 * 2;
const jour_8 = jour_1 * 8;
const jour_10 = jour_1 * 10;
const jour_30 = jour_1 * 30;

export class MobileScheduler extends NotificationScheduler {
  public static estNotificationEligible(
    notif: MobileNotification,
    utilisateur: Utilisateur,
  ): boolean {
    if (notif === MobileNotification.mobile_inscription_J2) {
      return (
        utilisateur.active_account &&
        this.getAgeCreationUtilisateur(utilisateur) > jour_2 &&
        this.not_sent(notif, utilisateur)
      );
    }

    return false;
  }
}
