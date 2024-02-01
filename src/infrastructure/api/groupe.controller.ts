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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { GroupeAPI } from './types/groupe/groupeAPI';
import { GroupeUseCase } from '../../../src/usecase/groupe.usecase';
import { GroupeAbonnement } from '@prisma/client';
import { Groupe } from '../../../src/domain/groupe/groupe';

@Controller()
@ApiBearerAuth()
@ApiTags('Groupe')
export class GroupeController extends GenericControler {
  constructor(private readonly groupeUsecase: GroupeUseCase) {
    super();
  }

  @Get('groupes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Liste les groupes publiques' })
  @ApiOkResponse({ type: GroupeAPI })
  async getGroupes(): Promise<GroupeAPI[]> {
    const groupes = await this.groupeUsecase.listGroupes();
    if (!groupes) throw new NotFoundException(`Pas de groupe`);
    return groupes.map((groupe) => this.toGroupeAPI(groupe));
  }

  @Get('groupes/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Récupérer les infos d'un groupe" })
  @ApiOkResponse({ type: GroupeAPI })
  async getGroupeById(@Param('id') id: string): Promise<GroupeAPI> {
    const group = await this.groupeUsecase.getGroupeById(id);
    if (!group) throw new NotFoundException(`Le groupe ${id} n'existe pas`);
    return this.toGroupeAPI(group);
  }

  @Get('utilisateurs/:id/groupes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Créer un nouveau groupe dont je suis admin' })
  @ApiOkResponse({ type: GroupeAPI })
  async listMyGroupes(
    @Body() group: GroupeAPI,
    @Param('id') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const groupes = await this.groupeUsecase.listMyGroupes(utilisateurId);
    if (!groupes) throw new NotFoundException(`Pas de groupe`);
    return groupes.map((groupe) => this.toGroupeAPI(groupe));
  }

  @Post('groupes')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Créer un nouveau groupe dont je suis admin' })
  @ApiOkResponse({ type: GroupeAPI })
  async createGroup(
    @Body() group: GroupeAPI,
    @Query('id_utilisateur') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAPI> {
    this.checkCallerId(req, utilisateurId);
    return this.toGroupeAPI(
      await this.groupeUsecase.createGroupeWithAdmin(
        group.name,
        group.description,
        utilisateurId,
      ),
    );
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
  ): Promise<GroupeAPI> {
    this.checkCallerId(req, utilisateurId);
    return this.toGroupeAPI(
      await this.groupeUsecase.updateOneOfMyGroupe(
        utilisateurId,
        groupeId,
        group.name,
        group.description,
      ),
    );
  }

  @Delete('groupes/:id_groupe')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Supprimme un groupe dont je suis admin' })
  @ApiOkResponse()
  async deleteGroupById(
    @Param('id_groupe') groupeId: string,
    @Query('id_utilisateur') utilisateurId: string,
    @Request() req: any,
  ): Promise<GroupeAPI> {
    this.checkCallerId(req, utilisateurId);
    return this.toGroupeAPI(
      await this.groupeUsecase.deleteOneOfMyGroupe(utilisateurId, groupeId),
    );
  }

  @Post('utilisateurs/:id_utilisateur/groupes/:id_groupe')
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
    return await this.groupeUsecase.joinGroupe(groupeId, utilisateurId);
  }

  // quitter un groupe
  //delete(`/utilisateurs/${utilisateurId}/groupes/${serviceId}`);
  @Delete('utilisateurs/:id_utilisateur/groupes/:id_groupe')
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

  private toGroupeAPI(group: Groupe): GroupeAPI {
    return {
      id: group?.id,
      name: group?.name,
      description: group?.description,
    };
  }
}
