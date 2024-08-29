import {
  NotificationHistory_v0,
  Notification_v0,
} from '../object_store/notification/NotificationHistory_v0';

export enum TypeNotification {
  welcome_email = 'welcome_email',
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

  getNouvellesNotifications(canal: CanalNotification): TypeNotification[] {
    return [TypeNotification.welcome_email];
  }
}
