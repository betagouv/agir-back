import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CompteurUsecase } from '../../usecase/compteur.usecase'
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Compteur } from '.prisma/client';

@Controller()
@ApiTags('Compteurs')
export class CompteurController {
  constructor(private readonly compteurUsecase: CompteurUsecase) { }

  @Get('compteurs/:id')
  async getCompteursById(@Param('id') id: string): Promise<Compteur> {
    let response = this.compteurUsecase.getById(id);
    if (response == null) {
      throw new NotFoundException(`Pas de compteur d'id ${id}`);
    }
    return response;
  }
  @Get('compteurs')
  async getCompteurs(): Promise<Compteur[]> {
    return this.compteurUsecase.list();
  }
  @Post('compteurs')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titre: {type : "string", description: "Titre du compteur"},
        valeur: {type : "string", description: "Valeur numérique entière du compteur"},
        utilisateurId: {type : "string", description: "id de l'utilisateur auquel est lié ce compteur"}
      },
    },
  })
  async createCompteurs(@Body() body:Compteur): Promise<Compteur> {
    return this.compteurUsecase.create(body.titre, body.valeur, body.utilisateurId);
  }
}
