import { MobileNotification } from '../../../src/domain/notification/notificationHistory';
import {
  GlobalUserVersion,
  Scope,
} from '../../../src/domain/utilisateur/utilisateur';
import { PushNotificationTemplateRepository } from '../../../src/infrastructure/push_notifications/pushNotificationTemplate.repository';
import { MessagingStatus } from '../../../src/infrastructure/push_notifications/pushNotificator';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { NotificationMobileUsecase } from '../../../src/usecase/notificationMobile.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('NotificationMobileUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let pushNotificationTemplateRepository =
    new PushNotificationTemplateRepository();

  let pushNotificator = {
    pushMessage: jest.fn(),
  };

  let notificationMobileUsecase = new NotificationMobileUsecase(
    utilisateurRepository,
    pushNotificationTemplateRepository,
    pushNotificator as any,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    pushNotificator.pushMessage.mockReset();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('envoyerNotificationsMobileAutomatiques : reponse OK du push', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      active_account: true,
      mobile_token: '123',
      mobile_token_updated_at: new Date(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      global_user_version: GlobalUserVersion.V2,
    });
    pushNotificator.pushMessage.mockImplementation(() => {
      return MessagingStatus.ok;
    });

    // WHEN
    const result =
      await notificationMobileUsecase.envoyerNotificationsMobileAutomatiques();

    // THEN
    expect(result).toEqual([
      'Sent for [utilisateur-id] : [mobile_inscription_J2]',
    ]);
    expect(pushNotificator.pushMessage).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual('123');
    expect(userDB.notification_history.sent_notifications).toHaveLength(1);
    expect(userDB.notification_history.sent_notifications[0].type).toEqual(
      MobileNotification.mobile_inscription_J2,
    );
    expect(
      userDB.notification_history.sent_notifications[0].date_envoie.getTime(),
    ).toBeGreaterThan(Date.now() - 200);
  });
  it('envoyerNotificationsMobileAutomatiques : reponse KO du push', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      active_account: true,
      mobile_token: '123',
      mobile_token_updated_at: new Date(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      global_user_version: GlobalUserVersion.V2,
    });
    pushNotificator.pushMessage.mockImplementation(() => {
      return MessagingStatus.ko;
    });

    // WHEN
    const result =
      await notificationMobileUsecase.envoyerNotificationsMobileAutomatiques();

    // THEN
    expect(result).toEqual([]);
    expect(pushNotificator.pushMessage).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual('123');
    expect(userDB.notification_history.sent_notifications).toEqual([]);
  });
  it('envoyerNotificationsMobileAutomatiques : reponse internal error du push', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      active_account: true,
      mobile_token: '123',
      mobile_token_updated_at: new Date(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      global_user_version: GlobalUserVersion.V2,
    });
    pushNotificator.pushMessage.mockImplementation(() => {
      return MessagingStatus.internal_error;
    });

    // WHEN
    const result =
      await notificationMobileUsecase.envoyerNotificationsMobileAutomatiques();

    // THEN
    expect(result).toEqual([]);
    expect(pushNotificator.pushMessage).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual('123');
    expect(userDB.notification_history.sent_notifications).toEqual([]);
  });
  it('envoyerNotificationsMobileAutomatiques : reponse bad token supprimer le token', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      active_account: true,
      mobile_token: '123',
      mobile_token_updated_at: new Date(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      global_user_version: GlobalUserVersion.V2,
    });
    pushNotificator.pushMessage.mockImplementation(() => {
      return MessagingStatus.bad_token;
    });

    // WHEN
    const result =
      await notificationMobileUsecase.envoyerNotificationsMobileAutomatiques();

    // THEN
    expect(result).toEqual([]);
    expect(pushNotificator.pushMessage).toHaveBeenCalledTimes(1);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.mobile_token).toEqual(null);
    expect(userDB.notification_history.sent_notifications).toEqual([]);
  });
});
