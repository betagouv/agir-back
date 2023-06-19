import { Utilisateur } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@Controller()
@ApiTags('Utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {}

  @Get('utilisateurs')
  async listUtilisateurs(): Promise<Utilisateur[]> {
      return this.utilisateurUsecase.listUtilisateurs();
  }

  @Get('utilisateurs/:id')
  async getUtilisateurByIdOrName(@Param('id') id:string): Promise<Utilisateur> {
    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(id);
    if (utilisateur == null) {
      utilisateur = await this.utilisateurUsecase.findFistUtilisateursByName(id);
    }
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ou de nom ${id}`);
    }
    return utilisateur;
  }
}
