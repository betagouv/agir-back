import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { App } from '../../../../src/domain/app';
import { CMSWebhookUsecase } from '../../../usecase/cms.webhook.usecase';
import { CMSWebhookAPI } from '../types/cms/CMSWebhookAPI';

@Controller()
@ApiTags('Incoming Data')
export class CMSController {
  constructor(
    private readonly interactionsDefinitionUsecase: CMSWebhookUsecase,
  ) {}
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @ApiBody({ type: CMSWebhookAPI })
  @Post('api/incoming/cms')
  async income(
    @Body() body: CMSWebhookAPI,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('API KEY webhook CMS manquante');
    }
    if (!authorization.endsWith(App.getCMSWebhookAPIKey())) {
      throw new ForbiddenException('API KEY webhook CMS incorrecte');
    }
    console.log(JSON.stringify(body));
    try {
      await this.interactionsDefinitionUsecase.manageIncomingCMSData(body);
    } catch (error) {
      console.log(error);
    }
  }
}
