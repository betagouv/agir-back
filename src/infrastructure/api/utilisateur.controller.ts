import { Citoyen, Utilisateur } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@Controller()
@ApiTags('Utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {}

  @Get('utilisateurs')
  async getUtilisateursByName(@Query() query: any): Promise<Utilisateur[]> {
    if (Object.keys(query).length > 1) {
      return this.utilisateurUsecase.findUtilisateursByName(query.name);
    } else {
      return this.utilisateurUsecase.listUtilisateurs();
    }
  }

  @Get('utilisateurs/:id')
  async getUtilisateurById(@Param('id') id:string): Promise<Utilisateur> {
    const utilisateur = await this.utilisateurUsecase.findUtilisateurById(id);
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${id}`);
    }
    return utilisateur;
  }
  @Post('utilisateurs')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {type : "string"},
        name: {type : "string"}
      },
    },
  })
  async createUtilisateur(@Body() body:Utilisateur): Promise<Utilisateur> {
    return this.utilisateurUsecase.createUtilisateur(body.name, body.id);
  }
}
