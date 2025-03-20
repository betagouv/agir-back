import { Body, Controller, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationEmailUsecase } from '../../usecase/notificationEmail.usecase';
import { GenericControler } from './genericControler';
import { DisableEmailAPI } from './types/email/tokenEmailAPI';

@Controller()
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationsController extends GenericControler {
  constructor(private readonly mailerUsecase: NotificationEmailUsecase) {
    super();
  }

  @ApiOperation({
    summary:
      'Desactive les notifications email pour un utilisateur via un token donné',
  })
  @Post('notifications/email/disable')
  @ApiOkResponse({
    type: String,
  })
  @ApiBody({
    type: DisableEmailAPI,
  })
  async disableUserEmails(@Body() body: DisableEmailAPI) {
    await this.mailerUsecase.disableUserEmails(body.token);
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
