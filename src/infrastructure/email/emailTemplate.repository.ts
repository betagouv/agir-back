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
  private email_relance_onboarding: HandlebarsTemplateDelegate;
  private email_relance_action: HandlebarsTemplateDelegate;
  private email_existing_account: HandlebarsTemplateDelegate;

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
      this.email_relance_onboarding = Handlebars.compile(
        await this.readTemplate('email_relance_onboarding.hbs'),
      );
      this.email_relance_action = Handlebars.compile(
        await this.readTemplate('email_relance_action.hbs'),
      );
      this.email_existing_account = Handlebars.compile(
        await this.readTemplate('email_existing_account.hbs'),
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
            PRENOM: utilisateur.pseudo,
            CONTACT_EMAIL: utilisateur.email,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            SERVICE_URL: `${App.getBaseURLFront()}/agir`,
            HOME_URL: App.getBaseURLFront(),
          }),
        };
      case TypeNotification.late_onboarding:
        return {
          subject: `Vos premiers pas avec J'agis 🌱`,
          body: this.email_relance_onboarding({
            PRENOM: utilisateur.pseudo,
            CONTACT_EMAIL: utilisateur.email,
            UNSUBSCRIBE_URL: unsubscribe_URL,
            SERVICE_URL: `${App.getBaseURLFront()}/agir`,
            HOME_URL: App.getBaseURLFront(),
          }),
        };
      case TypeNotification.waiting_action:
        const defi = utilisateur.defi_history.getPlusVieuxDefiEnCours();
        if (defi) {
          return {
            subject: `Avez-vous relevé le défi ? Validez votre progression sur J'agis !`,
            body: this.email_relance_action({
              PRENOM: utilisateur.pseudo,
              CONTACT_EMAIL: utilisateur.email,
              UNSUBSCRIBE_URL: unsubscribe_URL,
              TITRE_ACTION: defi.titre,
              ACTIONS_URL: `${App.getBaseURLFront()}/compte/mes-actions`,
              HOME_URL: App.getBaseURLFront(),
            }),
          };
        } else {
          return null;
        }
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
