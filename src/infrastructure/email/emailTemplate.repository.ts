import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import { App } from '../../domain/app';
import { TypeNotification } from '../../domain/notification/notificationHistory';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
const fs = require('node:fs/promises');
const path = require('path');

@Injectable()
export class EmailTemplateRepository {
  private email_inscription_code: HandlebarsTemplateDelegate;
  private email_change_mot_de_passe_code: HandlebarsTemplateDelegate;
  private email_connexion_code: HandlebarsTemplateDelegate;
  private email_welcome: HandlebarsTemplateDelegate;
  private email_existing_account: HandlebarsTemplateDelegate;

  // NEW MAILS
  private email_demande_feedback: HandlebarsTemplateDelegate;
  private email_relance_onboarding_j8: HandlebarsTemplateDelegate;
  private email_relance_onboarding_j14: HandlebarsTemplateDelegate;
  private email_utilisateur_inactif_j30: HandlebarsTemplateDelegate;
  private email_utilisateur_inactif_j60: HandlebarsTemplateDelegate;

  async onApplicationBootstrap(): Promise<void> {
    try {
      this.email_inscription_code = Handlebars.compile(
        await this.readTemplate('email_inscription_code.hbs'),
      );
      this.email_connexion_code = Handlebars.compile(
        await this.readTemplate('email_connexion_code.hbs'),
      );
      this.email_change_mot_de_passe_code = Handlebars.compile(
        await this.readTemplate('email_change_mot_de_passe_code.hbs'),
      );
      this.email_welcome = Handlebars.compile(
        await this.readTemplate('email_welcome.hbs'),
      );
      this.email_existing_account = Handlebars.compile(
        await this.readTemplate('email_existing_account.hbs'),
      );
      // NEW MAILS
      this.email_demande_feedback = Handlebars.compile(
        await this.readTemplate('email_demande_feedback.hbs'),
      );
      this.email_relance_onboarding_j8 = Handlebars.compile(
        await this.readTemplate('email_relance_onboarding_j8.hbs'),
      );
      this.email_relance_onboarding_j14 = Handlebars.compile(
        await this.readTemplate('email_relance_onboarding_j14.hbs'),
      );
      this.email_utilisateur_inactif_j30 = Handlebars.compile(
        await this.readTemplate('email_utilisateur_inactif_j30.hbs'),
      );
      this.email_utilisateur_inactif_j60 = Handlebars.compile(
        await this.readTemplate('email_utilisateur_inactif_j60.hbs'),
      );
    } catch (err) {
      console.error(err);
    }
  }

  public generateAnonymousEmailByType(
    emailType: TypeNotification,
  ): { subject: string; body: string } | null {
    switch (emailType) {
      case TypeNotification.email_existing_account:
        return {
          subject: `Connectez vous à J'agis !`,
          body: this.email_existing_account({
            URL_CONNEXION: `${App.getBaseURLFront()}/authentification`,
          }),
        };

      default:
        return null;
    }
  }
  public generateUserEmailByType(
    emailType: TypeNotification,
    utilisateur: Utilisateur,
    unsubscribe_token?: string,
  ): { subject: string; body: string } | null {
    let unsubscribe_URL: string;
    if (unsubscribe_token) {
      unsubscribe_URL = `${App.getBaseURLFront()}/se-desabonner?token=${unsubscribe_token}`;
    }

    switch (emailType) {
      case TypeNotification.connexion_code:
        return {
          subject: `${utilisateur.code} - Votre code connexion à J'agis`,
          body: this.email_connexion_code({
            CODE: utilisateur.code,
            URL_CODE: `${App.getBaseURLFront()}/validation-authentification?email=${
              utilisateur.email
            }`,
          }),
        };
      case TypeNotification.inscription_code:
        return {
          subject: `Votre code d'inscription J'agis`,
          body: this.email_inscription_code({
            CODE: utilisateur.code,
            URL_CODE: `${App.getBaseURLFront()}/validation-compte?email=${
              utilisateur.email
            }`,
          }),
        };
      case TypeNotification.change_mot_de_passe_code:
        return {
          subject: `Modification de mot de passe J'agis`,
          body: this.email_change_mot_de_passe_code({
            CODE: utilisateur.code,
            URL_CODE: `${App.getBaseURLFront()}/mot-de-passe-oublie/redefinir-mot-de-passe?email=${
              utilisateur.email
            }`,
          }),
        };
      case TypeNotification.welcome:
        return {
          subject: `Bienvenue dans J'agis !`,
          body: this.email_welcome({
            CONTACT_EMAIL: utilisateur.email,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            HOME_URL: App.getBaseURLFront(),
          }),
        };
      case TypeNotification.email_demande_feedback:
        return {
          subject: `Votre avis nous intéresse 🌱`,
          body: this.email_demande_feedback({
            PSEUDO: utilisateur.pseudo,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            MAIL_CONTACT_JAGIS: App.getEmailContact(),
          }),
        };
      case TypeNotification.email_relance_onboarding_j8:
        return {
          subject: `Vos premiers pas avec J’agis 🌱`,
          body: this.email_relance_onboarding_j8({
            PSEUDO: utilisateur.pseudo,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            HOME_URL: App.getBaseURLFront(),
            CONTACT_EMAIL: utilisateur.email,
          }),
        };
      case TypeNotification.email_relance_onboarding_j14:
        return {
          subject: `Relevez le défi ! 🌟`,
          body: this.email_relance_onboarding_j14({
            PSEUDO: utilisateur.pseudo,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            HOME_URL: App.getBaseURLFront(),
            CONTACT_EMAIL: utilisateur.email,
          }),
        };
      case TypeNotification.email_utilisateur_inactif_j30:
        return {
          subject: `Une nouvelle action pour vous sur J’agis ! 👕♻️`,
          body: this.email_utilisateur_inactif_j30({
            PSEUDO: utilisateur.pseudo,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            HOME_URL: App.getBaseURLFront(),
            BILAN_CONSOMMATION:
              App.getBaseURLFront() +
              '/action/bilan/action_bilan_conso/connaitre-les-impacts-lies-a-vos-achats',
          }),
        };
      case TypeNotification.email_utilisateur_inactif_j60:
        return {
          subject: `Dites-nous ce qu’on peut améliorer pour vous aider à agir 🌍`,
          body: this.email_utilisateur_inactif_j60({
            PSEUDO: utilisateur.pseudo,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            HOME_URL: App.getBaseURLFront(),
            MAIL_CONTACT_JAGIS: App.getEmailContact(),
          }),
        };
      default:
        return null;
    }
  }

  private async readTemplate(file_name: string): Promise<string> {
    return await fs.readFile(
      path.resolve(__dirname, `./templates/${file_name}`),
      {
        encoding: 'utf8',
      },
    );
  }
}
