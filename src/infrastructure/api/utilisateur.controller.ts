import { Utilisateur } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post, Query, Response } from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';

@Controller()
@ApiTags('Utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {}

  @Get('utilisateurs')
  @ApiQuery({
    name: "name",
    type: String,
    description: "Nom optionel de l'uilisateur",
    required: false
  })  async listUtilisateurs(@Query('name') name?:string): Promise<Utilisateur[]> {
      if(name === null){
        return this.utilisateurUsecase.listUtilisateurs();
      } else {
        return this.utilisateurUsecase.findUtilisateursByName(name);
      }
  }

  @Get('utilisateurs/:id')
  async getUtilisateurByIdOrName(@Param('id') id:string): Promise<Utilisateur> {
    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(id);
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
        name: {type : "string", description: "nom de l'utilisateur à créer"}
      },
    },
  })
@ApiOkResponse({
    description: "l'utilisateur crée",
    schema: {
      type: 'object',
      properties: {
        id: {type : "string", description: "id unique de l'utiliateur"},
        name: {type : "string", description: "nom de l'utilisateur créé"}
      },
    }
})
  async createUtilisateur(@Body('name') name:string, @Response() res){
    const utilisateur = await this.utilisateurUsecase.createUtilisateurByName(name);
    return res
      .header('location', `https://agir.gouv.fr/api/utiliateurs/${(await utilisateur).id}`)
      .json(utilisateur);
  }
}
