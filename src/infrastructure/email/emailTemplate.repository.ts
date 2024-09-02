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

  async onApplicationBootstrap(): Promise<void> {
    try {
      const email_inscription_code = await fs.readFile(
        path.resolve(__dirname, './templates/email_inscription_code.hbs'),
        {
          encoding: 'utf8',
        },
      );
      const email_welcome = await fs.readFile(
        path.resolve(__dirname, './templates/empty.hbs'),
        {
          encoding: 'utf8',
        },
      );

      this.email_inscription_code = Handlebars.compile(email_inscription_code);
      this.email_welcome = Handlebars.compile(email_welcome);
    } catch (err) {
      console.error(err);
    }
  }

  public generateEmailByType(
    emailType: TypeNotification,
    utilisateur: Utilisateur,
  ): { subject: string; body: string } | null {
    switch (emailType) {
      case TypeNotification.inscription_code:
        return {
          subject: `Votre code d'inscription Agir`,
          body: this.email_inscription_code({
            code: utilisateur.code,
            url_code: `${App.getBaseURLFront()}/validation-compte?email=${
              utilisateur.email
            }`,
          }),
        };
      case TypeNotification.welcome:
        return {
          subject: `Bienvenue dans Agir !`,
          body: this.email_welcome({}),
        };
      default:
        return null;
    }
  }
}
