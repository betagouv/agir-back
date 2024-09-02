import {
  NotificationHistory_v0,
  Notification_v0,
} from '../object_store/notification/NotificationHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';

const min_10 = 10 * 60 * 1000;
const jour_2 = 24 * 60 * 60 * 1000;

export enum TypeNotification {
  inscription_code = 'inscription_code',
  welcome = 'welcome',
}
export enum CanalNotification {
  email = 'email',
  mobile = 'mobile',
}
export class Notification {
  type: TypeNotification;
  canal: CanalNotification;
  date_envoie: Date;

  constructor(n: Notification_v0) {
    Object.assign(this, n);
  }
}

export class NotificationHistory {
  sent_notifications: Notification[];

  static active_notification_types: TypeNotification[] = [];

  constructor(m?: NotificationHistory_v0) {
    this.sent_notifications = [];
    if (m) {
      if (m.sent_notifications) {
        this.sent_notifications = m.sent_notifications.map(
          (n) => new Notification(n),
        );
      }
    }
  }

  public declareSentNotification(
    type: TypeNotification,
    canal: CanalNotification,
  ) {
    this.sent_notifications.push(
      new Notification({
        canal: canal,
        type: type,
        date_envoie: new Date(),
      }),
    );
  }

  getNouvellesNotificationsAPousser(
    canal: CanalNotification,
    utilisateur: Utilisateur,
  ): TypeNotification[] {
    if (canal === CanalNotification.mobile) {
      return [];
    }

    const result = [];

    if (!this.was_sent(TypeNotification.welcome)) {
      const age_creation_utilisateur =
        Date.now() - utilisateur.created_at.getTime();
      if (
        age_creation_utilisateur > min_10 &&
        age_creation_utilisateur < jour_2
      )
        result.push(TypeNotification.welcome);
    }

    return result.filter((n) =>
      NotificationHistory.active_notification_types.includes(n),
    );
  }

  private was_sent(type: TypeNotification): boolean {
    return this.sent_notifications.findIndex((n) => n.type === type) > -1;
  }
}
