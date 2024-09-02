import {
  CanalNotification,
  NotificationHistory,
  TypeNotification,
} from '../../../../src/domain/notification/notificationHistory';

describe('NotificationHistory', () => {
  it(`declareSentNotification : ajoute un notif dans l'historique avec la date`, () => {
    // GIVEN
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
    });

    // WHEN
    notifications.declareSentNotification(
      TypeNotification.welcome,
      CanalNotification.mobile,
    );

    // THEN
    expect(notifications.sent_notifications).toHaveLength(1);
    expect(notifications.sent_notifications[0].canal).toEqual(
      CanalNotification.mobile,
    );
    expect(notifications.sent_notifications[0].type).toEqual(
      TypeNotification.welcome,
    );
    expect(
      notifications.sent_notifications[0].date_envoie.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });
});
