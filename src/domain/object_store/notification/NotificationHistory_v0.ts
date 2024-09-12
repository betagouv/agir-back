import { Versioned } from '../versioned';
import {
  CanalNotification,
  NotificationHistory,
  TypeNotification,
} from '../../notification/notificationHistory';
import { Notification } from '../../notification/notificationHistory';

export class Notification_v0 {
  type: TypeNotification;
  canal: CanalNotification;
  date_envoie: Date;

  static map(notif: Notification): Notification_v0 {
    return {
      canal: notif.canal,
      type: notif.type,
      date_envoie: notif.date_envoie,
    };
  }
}

export class NotificationHistory_v0 extends Versioned {
  sent_notifications: Notification_v0[];
  enabled_canals: CanalNotification[];

  static serialise(notifH: NotificationHistory): NotificationHistory_v0 {
    return {
      version: 0,
      sent_notifications: notifH.sent_notifications.map((elem) =>
        Notification_v0.map(elem),
      ),
      enabled_canals: notifH.enabled_canals,
    };
  }
}
