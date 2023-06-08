import { Citoyen } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return "Hello World!";
  }
  @Get('citoyens/:id')
  async getCitoyenName(@Param('id') id): Promise<Citoyen> {
    const citoyen = await this.appService.getCitoyen(Number(id));
    if (citoyen == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return citoyen;
  }
  @Post('citoyens')
  async createCitoyen(@Body() body): Promise<Citoyen> {
    const citoyen = await this.appService.createCitoyen(body.name);
    return citoyen;
  }
}
