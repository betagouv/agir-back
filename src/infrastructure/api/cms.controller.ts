import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Webhooks CMS')
export class CMSController {
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
