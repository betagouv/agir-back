import {
  CanalNotification,
  EmailNotification,
  Notification,
  NotificationHistory,
  TypeNotification,
} from '../../../../src/domain/notification/notificationHistory';
import {
  GlobalUserVersion,
  ModeInscription,
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

describe('NotificationHistory', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it(`declareSentNotification : ajoute un notif dans l'historique avec la date`, () => {
    // GIVEN
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
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
  it(`isWelcomeEmailToSend : mail de welcome si rien`, () => {
    // GIVEN

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    utilisateur.active_account = true;
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toContain(EmailNotification.welcome);
  });
  it(`isWelcomeEmailToSend : pas de mail de welcome si compte non actif`, () => {
    // GIVEN

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    utilisateur.active_account = false;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).not.toContain(EmailNotification.welcome);
  });
  it(`isWelcomeEmailToSend : pas de mail de welcome si type pas actif`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = 'welcome';
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    utilisateur.active_account = true;
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).not.toContain(EmailNotification.welcome);
  });
  it(`isWelcomeEmailToSend : pas de mail de welcome si rien mais que utilisateur trop vieux (plus de 30j)`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(
      Date.now() - Math.round(1000 * 60 * 60 * 24 * 32),
    );
    utilisateur.active_account = true;
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).not.toContain(EmailNotification.welcome);
  });
  it(`isWelcomeEmailToSend : rien si notif deja envoyée`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 20);
    utilisateur.active_account = true;
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [
        new Notification({
          canal: CanalNotification.email,
          type: TypeNotification.welcome,
          date_envoie: new Date(),
        }),
      ],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });
    utilisateur.notification_history = notifications;

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).not.toContain(EmailNotification.welcome);
  });

  it(`isWelcomeEmailToSend : pas de welcome si pas encore 10 min`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 5);
    utilisateur.active_account = true;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).not.toContain(EmailNotification.welcome);
  });

  it(`getNouvellesNotifications : pas de notif late_onboarding si compte non actif`, () => {
    // GIVEN
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9);
    utilisateur.active_account = false;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(0);
  });

  it(`getNouvellesNotifications : pas de notif late_onboarding si moins de 8 jours`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = 'welcome';
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);
    utilisateur.active_account = true;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(0);
  });
  it(`getNouvellesNotifications : pas de notif si dejà envoyé`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = 'welcome';
    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9);
    utilisateur.active_account = true;
    utilisateur.notification_history.sent_notifications.push({
      type: TypeNotification.email_relance_onboarding_j8,
      canal: CanalNotification.email,
      date_envoie: new Date(),
    });

    // WHEN
    const result =
      utilisateur.notification_history.getNouvellesNotificationsEmailAPousser(
        utilisateur,
      );

    // THEN
    expect(result).toHaveLength(0);
  });

  it(`getNouvellesNotifications : email_relance_onboarding_j8`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = 'welcome';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 9);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.email_relance_onboarding_j8);
  });
  it(`getNouvellesNotifications : email_relance_onboarding_j8 pas de mail si user V1`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = 'welcome';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 9);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V1;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(0);
  });
  it(`getNouvellesNotifications : email_relance_onboarding_j14`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES =
      'welcome,email_relance_onboarding_j8';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 15);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.email_relance_onboarding_j14);
  });
  it(`getNouvellesNotifications : email_utilisateur_inactif_j30`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES =
      'welcome,email_relance_onboarding_j8,email_relance_onboarding_j14';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 100);
    utilisateur.derniere_activite = new Date(Date.now() - DAY_IN_MS * 31);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.email_utilisateur_inactif_j30);
  });
  it(`getNouvellesNotifications : email_utilisateur_inactif_j60`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES =
      'welcome,email_relance_onboarding_j8,email_relance_onboarding_j14,email_utilisateur_inactif_j30';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 100);
    utilisateur.derniere_activite = new Date(Date.now() - DAY_IN_MS * 61);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsEmailAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.email_utilisateur_inactif_j60);
  });
  it(`getNouvellesNotifications : mobile_inscription_J2`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_INACTIVES = '';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 3);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsMobileAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.mobile_inscription_J2);
  });
  it(`getNouvellesNotifications : mobile_inscription_J9`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MOBILE_INACTIVES = 'mobile_inscription_J2';

    const utilisateur = Utilisateur.createNewUtilisateur(
      'toto@dev.com',
      SourceInscription.mobile,
      ModeInscription.magic_link,
    );
    utilisateur.created_at = new Date(Date.now() - DAY_IN_MS * 10);
    utilisateur.active_account = true;
    utilisateur.global_user_version = GlobalUserVersion.V2;

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result =
      notifications.getNouvellesNotificationsMobileAPousser(utilisateur);

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.mobile_inscription_J9);
  });
});
