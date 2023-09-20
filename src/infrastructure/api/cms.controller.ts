import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { InteractionsDefinitionUsecase } from '../../../src/usecase/interactionsDefinition.usecase';
import { CMSWebhookAPI } from './types/cms/CMSWebhookAPI';

@Controller()
@ApiTags('Webhooks CMS')
export class CMSController {
  constructor(
    private readonly interactionsDefinitionUsecase: InteractionsDefinitionUsecase,
  ) {}
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @ApiBody({ type: CMSWebhookAPI })
  @Post('api/cms/income')
  async income(@Body() body: CMSWebhookAPI) {
    console.log(body.toString());
    await this.interactionsDefinitionUsecase.insertOrUpdateInteractionDefFromCMS(
      body,
    );
  }
}
