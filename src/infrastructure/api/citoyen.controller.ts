import { Citoyen } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CitoyenUsecase } from '../../usecase/citoyen.usecase';

@Controller()
export class CitoyenController {
  constructor(private readonly citoyenUsecase: CitoyenUsecase) {}

  @Get('citoyens/:id')
  async getCitoyenName(@Param('id') id): Promise<Citoyen> {
    const citoyen = await this.citoyenUsecase.getCitoyen(Number(id));
    if (citoyen == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return citoyen;
  }
  @Post('citoyens')
  async createCitoyen(@Body() body): Promise<Citoyen> {
    const citoyen = await this.citoyenUsecase.createCitoyen(body.name, body.conso);
    return citoyen;
  }
}
