import { Utilisateur } from '../utilisateur/utilisateur';
import { EmailNotification } from './notificationHistory';
import { NotificationScheduler } from './notificationScheduler';

export class EmailScheduler extends NotificationScheduler {
  public static estNotificationEligible(
    notif: EmailNotification,
    utilisateur: Utilisateur,
  ): boolean {
    if (notif === EmailNotification.waiting_action) {
      const plus_vieux_defi_encours =
        utilisateur.defi_history.getPlusVieuxDefiEnCours();

      return (
        utilisateur.active_account &&
        utilisateur.isV1User() &&
        this.not_sent(notif, utilisateur) &&
        plus_vieux_defi_encours &&
        Date.now() - plus_vieux_defi_encours.date_acceptation.getTime() >
          this.jour_10
      );
    }
    if (notif === EmailNotification.welcome) {
      const age = this.getAgeCreationUtilisateur(utilisateur);
      return (
        this.not_sent(notif, utilisateur) &&
        age > this.minute_10 &&
        age < this.jour_30 &&
        utilisateur.active_account
      );
    }
    if (notif === EmailNotification.email_demande_feedback) {
      const age_user = this.getAgeCreationUtilisateur(utilisateur);
      const age_activite = this.getAgeDerniereActivite(utilisateur);
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.not_sent(notif, utilisateur) &&
        age_user > this.jour_90 &&
        age_activite < this.jour_7 &&
        utilisateur.thematique_history.getNombreActionsFaites() > 3
      );
    }
    if (notif === EmailNotification.email_relance_onboarding_j8) {
      const age_user = this.getAgeCreationUtilisateur(utilisateur);
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.not_sent(notif, utilisateur) &&
        age_user > this.jour_8 &&
        utilisateur.thematique_history.getNombreActionsFaites() === 0
      );
    }
    if (notif === EmailNotification.email_relance_onboarding_j14) {
      const age_user = this.getAgeCreationUtilisateur(utilisateur);
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.not_sent(notif, utilisateur) &&
        age_user > this.jour_14 &&
        utilisateur.thematique_history.getNombreActionsFaites() === 0
      );
    }
    if (notif === EmailNotification.email_utilisateur_inactif_j30) {
      const age_activite = this.getAgeDerniereActivite(utilisateur);
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.not_sent(notif, utilisateur) &&
        age_activite > this.jour_30
      );
    }
    if (notif === EmailNotification.email_utilisateur_inactif_j60) {
      const age_activite = this.getAgeDerniereActivite(utilisateur);
      return (
        utilisateur.active_account &&
        utilisateur.isV2User() &&
        this.not_sent(notif, utilisateur) &&
        age_activite > this.jour_60
      );
    }

    return false;
  }
}
