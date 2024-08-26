import { Injectable } from '@nestjs/common';
const fs = require('node:fs/promises');
import Handlebars from 'handlebars';
const path = require('path');

@Injectable()
export class EmailTemplateRepository {
  private email_inscription_code: HandlebarsTemplateDelegate;

  async onApplicationBootstrap(): Promise<void> {
    try {
      const email_inscription_code = await fs.readFile(
        path.resolve(__dirname, './email_inscription_code.hbs'),
        {
          encoding: 'utf8',
        },
      );

      this.email_inscription_code = Handlebars.compile(email_inscription_code);
    } catch (err) {
      console.error(err);
    }
  }

  public generate_email_inscription_code(code, url_code): string {
    return this.email_inscription_code({
      code: code,
      url_code: url_code,
    });
  }
}
