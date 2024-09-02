import {
  NotificationHistory_v0,
  Notification_v0,
} from '../object_store/notification/NotificationHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';

const min_10 = 10 * 60 * 1000;

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

  constructor(n: Notification_v0) {
    Object.assign(this, n);
  }
}

export class NotificationHistory {
  sent_notifications: Notification[];

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

  getNouvellesNotifications(
    canal: CanalNotification,
    utilisateur: Utilisateur,
  ): TypeNotification[] {
    if (canal === CanalNotification.mobile) {
      return [];
    }

    const result = [];

    if (!this.was_sent(TypeNotification.welcome)) {
      if (Date.now() - utilisateur.created_at.getTime() > min_10)
        result.push(TypeNotification.welcome);
    }

    return result;
  }

  private was_sent(type: TypeNotification): boolean {
    return this.sent_notifications.findIndex((n) => n.type === type) > -1;
  }
}
