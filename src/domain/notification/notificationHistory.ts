import { App } from '../app';
import {
  NotificationHistory_v0,
  Notification_v0,
} from '../object_store/notification/NotificationHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';

const minute_10 = 10 * 60 * 1000;
const jour_1 = 24 * 60 * 60 * 1000;
const jour_2 = jour_1 * 2;
const jour_8 = jour_1 * 8;
const jour_10 = jour_1 * 10;
const jour_30 = jour_1 * 30;

export enum TypeNotification {
  inscription_code = 'inscription_code',
  welcome = 'welcome',
  late_onboarding = 'late_onboarding',
  waiting_action = 'waiting_action',
}
export enum CanalNotification {
  email = 'email',
  mobile = 'mobile',
}
export class Notification {
  type: TypeNotification;
  canal: CanalNotification;
  date_envoie: Date;

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

  public isNotificationActive(notif: TypeNotification) {
    return App.getActiveNotificationsListe().includes(notif);
  }

  public declareSentNotification(
    type: TypeNotification,
    canal: CanalNotification,
  ) {
    this.sent_notifications.push(
      new Notification({
        canal: canal,
        type: type,
        date_envoie: new Date(),
      }),
    );
  }

  public isWelcomeEmailToSend(utilisateur: Utilisateur): boolean {
    if (!this.isNotificationActive(TypeNotification.welcome)) {
      return false;
    }

    if (!this.was_sent(TypeNotification.welcome)) {
      const age = this.getAgeCreationUtilisateur(utilisateur);
      return age > minute_10 && age < jour_2;
    }
    return false;
  }

  getNouvellesNotificationsAPousser(
    canal: CanalNotification,
    utilisateur: Utilisateur,
  ): TypeNotification[] {
    if (canal === CanalNotification.mobile) {
      return [];
    }

    const result = [];

    this.addOnboardingIfEligible(result, utilisateur);

    this.addWaitingActionIfEligible(result, utilisateur);

    return result.filter((n) => this.isNotificationActive(n));
  }

  private addOnboardingIfEligible(
    encours: TypeNotification[],
    utilisateur: Utilisateur,
  ) {
    if (!this.was_sent(TypeNotification.late_onboarding)) {
      const age = this.getAgeCreationUtilisateur(utilisateur);
      if (
        age < jour_30 &&
        age > jour_8 &&
        !utilisateur.parcours_todo.isEndedTodo()
      )
        encours.push(TypeNotification.late_onboarding);
    }
  }

  private addWaitingActionIfEligible(
    encours: TypeNotification[],
    utilisateur: Utilisateur,
  ) {
    if (!this.was_sent(TypeNotification.waiting_action)) {
      const plus_vieux_defi_encours =
        utilisateur.defi_history.getPlusVieuxDefiEnCours();

      if (
        plus_vieux_defi_encours &&
        Date.now() - plus_vieux_defi_encours.date_acceptation.getTime() >
          jour_10
      ) {
        encours.push(TypeNotification.waiting_action);
      }
    }
  }

  private getAgeCreationUtilisateur(utilisateur: Utilisateur): number {
    return Date.now() - utilisateur.created_at.getTime();
  }

  private was_sent(type: TypeNotification): boolean {
    return this.sent_notifications.findIndex((n) => n.type === type) > -1;
  }
}
