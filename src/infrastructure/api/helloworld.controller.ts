import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
@Controller()
export class HelloworldController {
  @Get()
  @ApiExcludeEndpoint()
  getHello() {
    return "Hello World!";
  }
}
