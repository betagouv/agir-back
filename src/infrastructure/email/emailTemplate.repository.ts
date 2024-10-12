import { Injectable } from '@nestjs/common';
const fs = require('node:fs/promises');
import Handlebars from 'handlebars';
import { App } from '../../domain/app';
import { TypeNotification } from '../../domain/notification/notificationHistory';
import { Utilisateur } from '../../domain/utilisateur/utilisateur';
const path = require('path');

@Injectable()
export class EmailTemplateRepository {
  private email_inscription_code: HandlebarsTemplateDelegate;
  private email_welcome: HandlebarsTemplateDelegate;
  private email_relance_onboarding: HandlebarsTemplateDelegate;
  private email_relance_action: HandlebarsTemplateDelegate;

  async onApplicationBootstrap(): Promise<void> {
    try {
      const email_inscription_code = await await this.readTemplate(
        'email_inscription_code.hbs',
      );
      const email_welcome = await await this.readTemplate('email_welcome.hbs');
      const email_relance_onboarding = await this.readTemplate(
        'email_relance_onboarding.hbs',
      );
      const email_relance_action = await this.readTemplate(
        'email_relance_action.hbs',
      );

      this.email_inscription_code = Handlebars.compile(email_inscription_code);
      this.email_welcome = Handlebars.compile(email_welcome);
      this.email_relance_onboarding = Handlebars.compile(
        email_relance_onboarding,
      );
      this.email_relance_action = Handlebars.compile(email_relance_action);
    } catch (err) {
      console.error(err);
    }
  }

  public generateEmailByType(
    emailType: TypeNotification,
    utilisateur: Utilisateur,
    unsubscribe_token: string,
  ): { subject: string; body: string } | null {
    const unsubscribe_URL =
      App.getBaseURLFront + `/se-desabonner?token=${unsubscribe_token}`;

    switch (emailType) {
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
      case TypeNotification.welcome:
        return {
          subject: `Bienvenue dans J'agis !`,
          body: this.email_welcome({
            PRENOM: utilisateur.prenom,
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
            PRENOM: utilisateur.prenom,
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
              PRENOM: utilisateur.prenom,
              CONTACT_EMAIL: utilisateur.email,
              UNSUBSCRIBE_URL: unsubscribe_URL,
              TITRE_ACTION: defi.titre,
              ACTIONS_URL: `${App.getBaseURLFront()}/mon-compte/vos-actions`,
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
