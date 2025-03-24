import { Utilisateur } from '../utilisateur/utilisateur';
import { MobileNotification } from './notificationHistory';
import { NotificationScheduler } from './notificationScheduler';

export class MobileScheduler extends NotificationScheduler {
  public static estNotificationEligible(
    notif: MobileNotification,
    utilisateur: Utilisateur,
  ): boolean {
    if (notif === MobileNotification.mobile_inscription_J2) {
      return (
        utilisateur.active_account &&
        this.getAgeCreationUtilisateur(utilisateur) > this.jour_2 &&
        this.not_sent(notif, utilisateur)
      );
    }

    return false;
  }
}
