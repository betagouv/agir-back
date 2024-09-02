import {
  CanalNotification,
  Notification,
  NotificationHistory,
  TypeNotification,
} from '../../../../src/domain/notification/notificationHistory';
import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

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
  it(`getNouvellesNotifications : mail de welcome si rien`, () => {
    // GIVEN
    NotificationHistory.active_notification_types = [TypeNotification.welcome];
    const utilisateur = Utilisateur.createNewUtilisateur(
      'yo',
      'prenom',
      'toto@dev.com',
      1979,
      '91120',
      'PALAISEAU',
      false,
      SourceInscription.mobile,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.welcome);
  });
  it(`getNouvellesNotifications : pas de mail de welcome si type pas actif`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'yo',
      'prenom',
      'toto@dev.com',
      1979,
      '91120',
      'PALAISEAU',
      false,
      SourceInscription.mobile,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.welcome);
  });
  it(`getNouvellesNotifications : pas de mail de welcome si rien mais que utilisateur trop vieux (plus de 2j)`, () => {
    // GIVEN
    NotificationHistory.active_notification_types = [TypeNotification.welcome];
    const utilisateur = Utilisateur.createNewUtilisateur(
      'yo',
      'prenom',
      'toto@dev.com',
      1979,
      '91120',
      'PALAISEAU',
      false,
      SourceInscription.mobile,
    );
    utilisateur.created_at = new Date(
      Date.now() - Math.round(1000 * 60 * 60 * 24 * 2.1),
    );
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(0);
  });
  it(`getNouvellesNotifications : rien si notif ddeja envoyée`, () => {
    // GIVEN
    NotificationHistory.active_notification_types = [TypeNotification.welcome];
    const utilisateur = Utilisateur.createNewUtilisateur(
      'yo',
      'prenom',
      'toto@dev.com',
      1979,
      '91120',
      'PALAISEAU',
      false,
      SourceInscription.mobile,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [
        new Notification({
          canal: CanalNotification.email,
          type: TypeNotification.welcome,
          date_envoie: new Date(),
        }),
      ],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(0);
  });
  NotificationHistory.active_notification_types = [TypeNotification.welcome];
  it(`getNouvellesNotifications : pas de welcome si pas encore 10 min`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'yo',
      'prenom',
      'toto@dev.com',
      1979,
      '91120',
      'PALAISEAU',
      false,
      SourceInscription.mobile,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 5);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(0);
  });
});
