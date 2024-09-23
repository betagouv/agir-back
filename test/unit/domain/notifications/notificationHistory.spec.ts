import { Categorie } from '../../../../src/domain/contenu/categorie';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { DefiStatus } from '../../../../src/domain/defis/defi';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import {
  CanalNotification,
  Notification,
  NotificationHistory,
  TypeNotification,
} from '../../../../src/domain/notification/notificationHistory';
import { Defi_v0 } from '../../../../src/domain/object_store/defi/defiHistory_v0';
import { Tag } from '../../../../src/domain/scoring/tag';
import { Univers } from '../../../../src/domain/univers/univers';
import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

describe('NotificationHistory', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules();
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
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';

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
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.isWelcomeEmailToSend(utilisateur);

    // THEN
    expect(result).toEqual(true);
  });
  it(`isWelcomeEmailToSend : pas de mail de welcome si type pas actif`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = '';
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
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.isWelcomeEmailToSend(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });
  it(`isWelcomeEmailToSend : pas de mail de welcome si rien mais que utilisateur trop vieux (plus de 2j)`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.isWelcomeEmailToSend(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });
  it(`isWelcomeEmailToSend : rien si notif deja envoyée`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.isWelcomeEmailToSend(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });
  process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome';

  it(`isWelcomeEmailToSend : pas de welcome si pas encore 10 min`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.isWelcomeEmailToSend(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });

  it(`getNouvellesNotifications : notif late_onboarding`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.late_onboarding);
  });

  it(`getNouvellesNotifications : pas de notif late_onboarding si moins de 8 jours`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(0);
  });
  it(`getNouvellesNotifications : pas de notif late_onboarding si dejà envoyé`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome,late_onboarding';
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
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9);
    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [
        {
          type: TypeNotification.late_onboarding,
          canal: CanalNotification.email,
          date_envoie: new Date(),
        },
      ],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(0);
  });
  it(`getNouvellesNotifications : vieux defis`, () => {
    // GIVEN
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'waiting_action';

    const DAY_IN_MS = 1000 * 60 * 60 * 24;

    const DEFI_1: Defi_v0 = {
      id: '1',
      points: 5,
      tags: [Tag.transport],
      titre: 'titre',
      thematique: Thematique.alimentation,
      astuces: 'astuce',
      date_acceptation: new Date(Date.now() - 3 * DAY_IN_MS),
      pourquoi: 'pourquoi',
      sous_titre: 'sous_titre',
      status: DefiStatus.todo,
      universes: [Univers.climat],
      accessible: true,
      motif: 'truc',
      categorie: Categorie.recommandation,
      mois: [1],
      conditions: [[{ id_kyc: 1, code_kyc: '123', code_reponse: 'oui' }]],
      sont_points_en_poche: true,
    };

    const defiHistory = new DefiHistory({
      version: 0,
      defis: [
        {
          ...DEFI_1,
          id: '1',
          status: DefiStatus.en_cours,
          date_acceptation: new Date(100),
        },
      ],
    });

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
    utilisateur.defi_history = defiHistory;
    utilisateur.created_at = new Date(Date.now() - 1000 * 60 * 60 * 24 * 9);

    const notifications = new NotificationHistory({
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    });

    // WHEN
    const result = notifications.getNouvellesNotificationsAPousser(
      CanalNotification.email,
      utilisateur,
    );

    // THEN
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(TypeNotification.waiting_action);
  });
});
