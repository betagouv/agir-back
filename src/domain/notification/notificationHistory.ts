import { App } from '../app';
import {
  NotificationHistory_v0,
  Notification_v0,
} from '../object_store/notification/NotificationHistory_v0';
import { Utilisateur } from '../utilisateur/utilisateur';
import { EmailScheduler } from './emailScheduler';
import { MobileScheduler } from './mobileScheduler';

export enum EmailNotification {
  email_existing_account = 'email_existing_account',
  inscription_code = 'inscription_code',
  change_mot_de_passe_code = 'change_mot_de_passe_code',
  connexion_code = 'connexion_code',

  //AUTO
  welcome = 'welcome',
  late_onboarding = 'late_onboarding',
  waiting_action = 'waiting_action',

  // NEW
  email_demande_feedback = 'email_demande_feedback',
  email_relance_onboarding_j8 = 'email_relance_onboarding_j8',
  email_relance_onboarding_j14 = 'email_relance_onboarding_j14',
  email_utilisateur_inactif_j30 = 'email_utilisateur_inactif_j30',
  email_utilisateur_inactif_j60 = 'email_utilisateur_inactif_j60',
}

export enum MobileNotification {
  mobile_inscription_J2 = 'mobile_inscription_J2',
  mobile_inscription_J9 = 'mobile_inscription_J9',
}
export const TypeNotification = { ...EmailNotification, ...MobileNotification };
export type TypeNotification = EmailNotification | MobileNotification;

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
  enabled_canals: CanalNotification[];

  constructor(m?: NotificationHistory_v0) {
    this.sent_notifications = [];
    this.enabled_canals = [CanalNotification.email, CanalNotification.mobile];

    if (m) {
      if (m.sent_notifications) {
        this.sent_notifications = m.sent_notifications.map(
          (n) => new Notification(n),
        );
      }
      this.enabled_canals = m.enabled_canals ? m.enabled_canals : [];
    }
  }

  public isCanalEnabled(canal: CanalNotification): boolean {
    return this.enabled_canals.includes(canal);
  }
  public isCanalDisabled(canal: CanalNotification): boolean {
    return !this.enabled_canals.includes(canal);
  }
  public disableCanal(canal: CanalNotification) {
    this.enabled_canals = this.enabled_canals.filter((n) => n != canal);
  }
  public enableCanal(canal: CanalNotification) {
    if (!this.enabled_canals.includes(canal)) {
      this.enabled_canals.push(canal);
    }
  }

  public isNotificationActive(notif: TypeNotification) {
    return !App.getInactiveNotificationsListe().includes(notif);
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

  public getNouvellesNotificationsMobileAPousser(
    utilisateur: Utilisateur,
  ): MobileNotification[] {
    const result: MobileNotification[] = [];
    for (let notification in MobileNotification) {
      const notif = MobileNotification[notification];
      if (MobileScheduler.estNotificationEligible(notif, utilisateur)) {
        result.push(notif);
      }
    }
    return result.filter((n) => this.isNotificationActive(n));
  }
  public getNouvellesNotificationsEmailAPousser(
    utilisateur: Utilisateur,
  ): EmailNotification[] {
    const result: EmailNotification[] = [];
    for (let notification in EmailNotification) {
      const notif = EmailNotification[notification];
      if (EmailScheduler.estNotificationEligible(notif, utilisateur)) {
        result.push(notif);
      }
    }
    return result.filter((n) => this.isNotificationActive(n));
  }
}
