import { Controller, Get } from '@nestjs/common';

@Controller()
export class HelloworldController {
  @Get()
  getHello() {
    return "Hello World!";
  }
}
