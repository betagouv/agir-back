import { Injectable } from '@nestjs/common';
const Brevo = require('@getbrevo/brevo');

@Injectable()
export class EmailSender {
  private client;
  private apiInstance;

  constructor() {
    this.client = Brevo.ApiClient.instance;
    var apiKey = this.client.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_API_TOKEN;
    this.apiInstance = new Brevo.TransactionalEmailsApi();
  }

  public async sendEmail(
    email_to: string,
    name: string,
    text_content: string,
    subject: string,
  ) {
    const smtpEmail = new Brevo.SendSmtpEmail();
    smtpEmail.to = [{ email: email_to, name: name }];
    smtpEmail.sender = { name: 'Agir', email: 'noreply@agir.gouv.fr' };
    smtpEmail.subject = subject;
    smtpEmail.textContent = text_content;

    if (process.env.EMAIL_ENABLED === 'true') {
      this.apiInstance.sendTransacEmail(smtpEmail);
    } else {
      console.log(`Email not sent in test mode: 
      subject: ${subject}
      email: ${email_to}
      name: ${name}
      text: ${text_content}`);
    }
  }
}
