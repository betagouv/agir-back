import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Webhooks')
export class WebhooksController {
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @Post('api/cms/income')
  async income(@Body() body: any) {
    console.log(body);
  }
}
