import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Delete,
  Put,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { GroupeAPI } from './types/groupe/groupeApi';
import { GroupeUseCase } from '../../../src/usecase/groupe.usecase';
import { GroupeAbonnement } from '@prisma/client';
import { ErrorService } from '../errorService';

@Controller()
@ApiBearerAuth()
@ApiTags('Groupe')
export class GroupeController extends GenericControler {
  constructor(private readonly groupeUsecase: GroupeUseCase) {
    super();
  }

  @Get('groupes/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Récupérer les infos d'un groupe" })
  @ApiOkResponse({ type: GroupeAPI })
  async getGroupeById(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GroupeAPI> {
    const group = await this.groupeUsecase.getGroupeById(id);
    if (!group) throw new NotFoundException(`Le groupe ${id} n'existe pas`);
    return this.toGroupeAPI(group);
  }

  @Post('utilisateurs/:id/groupe')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Créer un nouveau groupe dont je suis admin' })
  @ApiOkResponse({ type: GroupeAPI })
  async createGroup(
    @Body() group: GroupeAPI,
    @Param('id') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAPI | false> {
    this.checkCallerId(req, utilisateurId);
    const createdGroupe = await this.groupeUsecase.createGroupeWithAdmin(
      group.name,
      group.description,
      utilisateurId,
    );

    return createdGroupe ? this.toGroupeAPI(createdGroupe) : false;
  }

  @Put('utilisateurs/:id/groupes/:id_groupe')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'MAJ un groupe' })
  @ApiOkResponse({ type: GroupeAPI })
  async updateGroupById(
    @Param('id_groupe') groupeId: string,
    @Param('id') utilisateurId: string,
    @Body() group: GroupeAPI,
    @Request() req: any,
  ): Promise<GroupeAPI | false> {
    this.checkCallerId(req, utilisateurId);
    const updatedGroupe = await this.groupeUsecase.updateOneOfMyGroupe(
      utilisateurId,
      groupeId,
      group.name,
      group.description,
    );
    return updatedGroupe ? this.toGroupeAPI(updatedGroupe) : false;
  }

  @Delete('utilisateurs/:id/groupes/:id_groupe')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Supprimme un groupe dont je suis admin' })
  @ApiOkResponse()
  async deleteGroupById(
    @Param('id_groupe') groupeId: string,
    @Param('id') utilisateurId: string,
    @Request() req: any,
  ): Promise<boolean> {
    this.checkCallerId(req, utilisateurId);
    return await this.groupeUsecase.deleteOneOfMyGroupe(
      utilisateurId,
      groupeId,
    );
  }

  @Put('groupes/:id_groupe/join/:id_utilisateur')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Joindre un groupe' })
  @ApiOkResponse({ type: GroupeAPI })
  async joinGroup(
    @Param('id_groupe') groupeId: string,
    @Param('id_utilisateur') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAbonnement> {
    this.checkCallerId(req, utilisateurId);
    // todo check if groupe exist
    // todo check if groupe is not private
    try {
      return await this.groupeUsecase.joinGroupe(
        groupeId,
        utilisateurId,
        false,
      );
    } catch (error) {
      throw new BadRequestException(ErrorService.toStringOrObject(error));
    }
  }

  @Put('groupes/:id_groupe/quit/:id_utilisateur')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Quitter un groupe' })
  @ApiOkResponse({ type: GroupeAPI })
  async quitGroup(
    @Param('id_groupe') groupeId: string,
    @Param('id_utilisateur') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAbonnement> {
    this.checkCallerId(req, utilisateurId);
    // todo check if groupe exist
    // todo check if user is last member, delete groupe

    return await this.groupeUsecase.removeUtilisateurFromGroupe(
      utilisateurId,
      groupeId,
    );
  }

  private toGroupeAPI(group: any): GroupeAPI {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
    };
  }
}
