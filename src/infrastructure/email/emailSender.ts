import { Injectable } from '@nestjs/common';
import { App } from '../../../src/domain/app';
const Brevo = require('@getbrevo/brevo');

@Injectable()
export class EmailSender {
  private client?;
  private apiInstance?;

  constructor() {
    this.client = Brevo.ApiClient.instance;
    const apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = App.getBrevoApiToken();
    this.apiInstance = new Brevo.TransactionalEmailsApi();
  }

  public async sendEmail(
    email_to: string,
    name: string,
    text_content_html: string,
    subject: string,
  ) {
    const smtpEmail = new Brevo.SendSmtpEmail();
    smtpEmail.to = [{ email: email_to, name: name }];
    smtpEmail.sender = { name: 'Agir', email: 'noreply-agir@beta.gouv.fr' };
    smtpEmail.subject = subject;
    //smtpEmail.textContent = text_content;
    smtpEmail.htmlContent = text_content_html;
    smtpEmail.replyTo = { email: App.getEmailReplyTo(), name: 'Contact' };

    if (App.isMailEnabled()) {
      console.log(`Sending email to ${email_to}`);
      this.apiInstance.sendTransacEmail(smtpEmail);
    } else {
      console.log(`Email not sent in test mode: 
      subject: ${subject}
      email: ${email_to}
      name: ${name}`);
    }
  }
}
