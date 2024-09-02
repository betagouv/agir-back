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

  async onApplicationBootstrap(): Promise<void> {
    try {
      const email_inscription_code = await fs.readFile(
        path.resolve(__dirname, './templates/email_inscription_code.hbs'),
        {
          encoding: 'utf8',
        },
      );

      this.email_inscription_code = Handlebars.compile(email_inscription_code);
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
      default:
        return null;
    }
  }
}
