import { Controller, Param, Request, Post, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { MailerUsecase } from '../../usecase/mailer.usecase';

@Controller()
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationsController extends GenericControler {
  constructor(private readonly mailerUsecase: MailerUsecase) {
    super();
  }

  @ApiOperation({
    summary:
      'Desactive les notifications email pour un utilisateur via un token donné',
  })
  @Get('notifications/email/:token/disable')
  @ApiOkResponse({
    type: String,
  })
  async disableUserEmails(@Param('token') token: string): Promise<string> {
    await this.mailerUsecase.disableUserEmails(token);
    return `Votre demande de désinscription des messages électroniques Agir a bien été prise en compte !
Vous pouvez à tout moment rétablir ces notifications dans votre profile Agir`;
  }

  @Post('/notifications/email/send_notifications')
  @ApiOperation({
    summary: `envoie toutes les notifications mails qui doivent l'être`,
  })
  async envoyer_notifications_email(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.mailerUsecase.envoyerEmailsAutomatiques();
  }
  @Post('/notifications/email/send_welcomes')
  @ApiOperation({
    summary: `Envoie tous les mails de bienvenue`,
  })
  async envoyer_emails_welcome(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.mailerUsecase.envoyerEmailsWelcome();
  }
}
