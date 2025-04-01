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
        utilisateur.isV2User() &&
        this.getAgeCreationUtilisateur(utilisateur) > this.jour_2 &&
        this.not_sent(notif, utilisateur)
      );
    }
    if (notif === MobileNotification.mobile_inscription_J9) {
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.getAgeCreationUtilisateur(utilisateur) > this.jour_9 &&
        this.not_sent(notif, utilisateur)
      );
    }

    return false;
  }
}
