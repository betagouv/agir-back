import { Injectable } from '@nestjs/common';
import { App } from '../../../src/domain/app';
import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';

@Injectable()
export class EmailSender {
  private apiInstance: TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      App.getBrevoApiToken(),
    );
  }

  public async sendEmail(
    email_to: string,
    name: string,
    text_content_html: string,
    subject: string,
  ): Promise<boolean> {
    if (!name || name === '') {
      name = 'utilisateur';
    }

    const smtpEmail = new SendSmtpEmail();
    smtpEmail.to = [{ email: email_to, name: name }];
    smtpEmail.sender = { name: `J'agis`, email: 'noreply-jagis@beta.gouv.fr' };
    smtpEmail.subject = subject;
    //smtpEmail.textContent = text_content;
    smtpEmail.htmlContent = text_content_html;
    smtpEmail.replyTo = { email: App.getEmailReplyTo(), name: 'Contact' };

    if (App.isMailEnabled()) {
      try {
        console.log(`Sending email to ${email_to}`);
        await this.apiInstance.sendTransacEmail(smtpEmail);
        console.log(`Sending email to ${email_to} OK`);
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      console.log(`Email not sent in test mode: 
      subject: ${subject}
      email: ${email_to}
      name: ${name}`);
      return true;
    }
  }
}
