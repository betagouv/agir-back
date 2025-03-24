import { Utilisateur } from '../utilisateur/utilisateur';
import { MobileNotification, TypeNotification } from './notificationHistory';

export class NotificationScheduler {
  public static minute_10 = 10 * 60 * 1000;
  public static jour_1 = 24 * 60 * 60 * 1000;
  public static jour_2 = this.jour_1 * 2;
  public static jour_7 = this.jour_1 * 7;
  public static jour_8 = this.jour_1 * 8;
  public static jour_9 = this.jour_1 * 9;
  public static jour_10 = this.jour_1 * 10;
  public static jour_14 = this.jour_1 * 14;
  public static jour_30 = this.jour_1 * 30;
  public static jour_60 = this.jour_1 * 60;
  public static jour_90 = this.jour_1 * 90;

  static getAgeCreationUtilisateur(utilisateur: Utilisateur): number {
    return Date.now() - utilisateur.created_at.getTime();
  }

  static getAgeDerniereActivite(utilisateur: Utilisateur): number {
    return Date.now() - utilisateur.derniere_activite.getTime();
  }

  static was_sent(type: MobileNotification, utilisateur: Utilisateur): boolean {
    return (
      utilisateur.notification_history.sent_notifications.findIndex(
        (n) => n.type === type,
      ) > -1
    );
  }
  static not_sent(type: TypeNotification, utilisateur: Utilisateur): boolean {
    return (
      utilisateur.notification_history.sent_notifications.findIndex(
        (n) => n.type === type,
      ) === -1
    );
  }
}
