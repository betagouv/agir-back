import { Utilisateur } from '../utilisateur/utilisateur';
import { MobileNotification, TypeNotification } from './notificationHistory';

const minute_10 = 10 * 60 * 1000;
const jour_1 = 24 * 60 * 60 * 1000;
const jour_2 = jour_1 * 2;
const jour_8 = jour_1 * 8;
const jour_10 = jour_1 * 10;
const jour_30 = jour_1 * 30;

export class NotificationScheduler {
  static getAgeCreationUtilisateur(utilisateur: Utilisateur): number {
    return Date.now() - utilisateur.created_at.getTime();
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
