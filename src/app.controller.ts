import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return "Hello World!";
  }
  @Get('citoyens/:id')
  async getCitoyenName(@Param('id') id): Promise<string> {
    return this.appService.getCitoyenName(Number(id));
  }
}
