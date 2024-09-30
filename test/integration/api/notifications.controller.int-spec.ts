import { CanalNotification } from '../../../src/domain/notification/notificationHistory';
import { NotificationHistory_v0 } from '../../../src/domain/object_store/notification/NotificationHistory_v0';
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

  it(`GET /notifications/email/12345678901234567890123/disable - desactive ok les mails de l'utilisateur`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      unsubscribe_mail_token: '12345678901234567890123',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .get('/notifications/email/12345678901234567890123/disable')
      .set('Accept', `text/html`);

    // THEN
    expect(response.status).toBe(200);
    expect(response.text)
      .toEqual(`Votre demande de désinscription des messages électroniques Agir a bien été prise en compte !
Vous pouvez à tout moment rétablir ces notifications dans votre profile Agir`);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.notification_history.enabled_canals).toEqual([
      CanalNotification.mobile,
    ]);
  });

  it(`GET /notifications/email/bad/disable - mauvais token`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      unsubscribe_mail_token: 'bad',
    });

    // WHEN
    const response = await TestUtil.GET('/notifications/email/bad/disable');

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('069');

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.notification_history.enabled_canals).toEqual([
      CanalNotification.email,
      CanalNotification.mobile,
    ]);
  });

  it(`POST /notifications/email/send_notifications n'envoie pas le welcome`, async () => {
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
    const response = await TestUtil.POST(
      '/notifications/email/send_notifications',
    );

    // THEN
    expect(response.status).toBe(201);
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.notification_history.sent_notifications).toHaveLength(0);
  });
  it(`POST /notifications/email/send_notifications envoie le mail late_onboarding`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    process.env.NOTIFICATIONS_MAIL_ACTIVES = 'late_onboarding';
    await TestUtil.create(DB.utilisateur);

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
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.notification_history.sent_notifications).toHaveLength(1);
    expect(response.body).toEqual([
      'Sent for [utilisateur-id] : [late_onboarding]',
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
      notification_history: notifications,
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
    const userDB = await utilisateurRepository.getById('utilisateur-id');
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
    const userDB = await utilisateurRepository.getById('utilisateur-id');
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
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.notification_history.sent_notifications).toHaveLength(1);
    expect(response.body).toEqual(['Sent welcome email to [utilisateur-id]']);

    // WHEN
    const response2 = await TestUtil.POST('/notifications/email/send_welcomes');

    // THEN
    expect(response2.status).toBe(201);
    const userDB2 = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB2.notification_history.sent_notifications).toHaveLength(1);
    expect(response2.body).toEqual([]);
  });
});
