import { Controller, Get } from '@nestjs/common';

@Controller()
export class CitoyenController {
  @Get()
  getHello() {
    return "Hello World!";
  }
}
