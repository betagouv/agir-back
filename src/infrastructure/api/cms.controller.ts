import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CMSWebhookAPI } from './types/cms/CMSWebhookAPI';

@Controller()
@ApiTags('Webhooks CMS')
export class CMSController {
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @ApiBody({ type: CMSWebhookAPI })
  @Post('api/cms/income')
  async income(@Body() body: CMSWebhookAPI) {
    console.log(body);
  }
}
