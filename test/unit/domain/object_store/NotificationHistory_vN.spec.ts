import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import {} from '../../../../src/domain/logement/logement';
import {
  CanalNotification,
  Notification,
  NotificationHistory,
  TypeNotification,
} from '../../../../src/domain/notification/notificationHistory';
import { NotificationHistory_v0 } from '../../../../src/domain/object_store/notification/NotificationHistory_v0';

describe('NotificationHistory vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.NotificationHistory);

    // WHEN
    new NotificationHistory(raw);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new NotificationHistory({
      version: 0,
      sent_notifications: [
        new Notification({
          canal: CanalNotification.email,
          type: TypeNotification.welcome,
        }),
      ],
    });

    // WHEN
    const raw = NotificationHistory_v0.serialise(domain_start);
    const domain_end = new NotificationHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new NotificationHistory({
      version: 0,
      sent_notifications: [
        new Notification({
          canal: CanalNotification.email,
          type: TypeNotification.welcome,
        }),
      ],
    });

    // WHEN
    const raw = NotificationHistory_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.NotificationHistory,
    );
    const domain_end = new NotificationHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
