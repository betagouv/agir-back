import { Citoyen } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CitoyenUsecase } from '../../usecase/citoyen.usecase';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@Controller()
@ApiTags('Citoyen')
export class CitoyenController {
  constructor(private readonly citoyenUsecase: CitoyenUsecase) {}

  @Get('citoyens/:id')
  async getCitoyenName(@Param('id') id:number): Promise<Citoyen> {
    const citoyen = await this.citoyenUsecase.getCitoyen(Number(id));
    if (citoyen == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return citoyen;
  }
  @Get('citoyens')
  async listCitoyens(): Promise<Citoyen[]> {
    return await this.citoyenUsecase.listCitoyens();
  }
  @Post('citoyens')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {type : "string"},
        conso: {type : "integer"},
      },
    },
  })
  async createCitoyen(@Body() body:Citoyen): Promise<Citoyen> {
    return this.citoyenUsecase.createCitoyen(body.name, body.conso);
  }
}
