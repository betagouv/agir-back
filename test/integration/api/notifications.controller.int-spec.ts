import { CanalNotification } from '../../../src/domain/notification/notificationHistory';
import { NotificationHistory_v0 } from '../../../src/domain/object_store/notification/NotificationHistory_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Notifications (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  it(`GET /notifications/email/disable - desactive ok les mails de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      unsubscribe_mail_token: '12345678901234567890123',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/notifications/email/disable')
      .send({
        token: '12345678901234567890123',
      });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.notification_history.enabled_canals).toEqual([
      CanalNotification.mobile,
    ]);
  });

  it(`GET /notifications/email/disable - mauvais token`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      unsubscribe_mail_token: 'hohofsjflqsfj',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/notifications/email/disable')
      .send({
        token: 'bad',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('069');

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.notification_history.enabled_canals).toEqual([
      CanalNotification.email,
      CanalNotification.mobile,
    ]);
  });

  it(`POST /notifications/email/send_notifications ,n'envoie  pas le mail late_onboarding si canal email desactivé`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'late_onboarding';
    const notifications: NotificationHistory_v0 = {
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.mobile],
    };

    await TestUtil.create(DB.utilisateur, {
      notification_history: notifications as any,
    });

    await TestUtil.prisma.utilisateur.update({
      where: {
        id: 'utilisateur-id',
      },
      data: {
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      },
    });

    // WHEN
    const response = await TestUtil.POST(
      '/notifications/email/send_notifications',
    );

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.notification_history.sent_notifications).toHaveLength(0);
    expect(response.body).toEqual([]);
  });
  it('POST /notifications/email/send_welcomes envoie le mail de bienvenu', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome';
    await TestUtil.create(DB.utilisateur);

    await TestUtil.prisma.utilisateur.update({
      where: {
        id: 'utilisateur-id',
      },
      data: {
        created_at: new Date(Date.now() - 1000 * 60 * 20),
      },
    });

    // WHEN
    const response = await TestUtil.POST('/notifications/email/send_welcomes');

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.notification_history.sent_notifications).toHaveLength(1);
    expect(response.body).toEqual(['Sent welcome email to [utilisateur-id]']);
  });
  it('POST /notifications/email/send_welcomes pas de welcome 2 fois de suites ^^', async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'welcome';
    await TestUtil.create(DB.utilisateur);

    await TestUtil.prisma.utilisateur.update({
      where: {
        id: 'utilisateur-id',
      },
      data: {
        created_at: new Date(Date.now() - 1000 * 60 * 20),
      },
    });

    // WHEN
    const response = await TestUtil.POST('/notifications/email/send_welcomes');

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.notification_history.sent_notifications).toHaveLength(1);
    expect(response.body).toEqual(['Sent welcome email to [utilisateur-id]']);

    // WHEN
    const response2 = await TestUtil.POST('/notifications/email/send_welcomes');

    // THEN
    expect(response2.status).toBe(201);
    const userDB2 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB2.notification_history.sent_notifications).toHaveLength(1);
    expect(response2.body).toEqual([]);
  });
});
