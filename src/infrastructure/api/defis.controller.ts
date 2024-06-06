import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { DefisUsecase } from '../../../src/usecase/defis.usecase';
import { DefiAPI, PatchDefiStatusAPI } from './types/defis/DefiAPI';
import { Univers } from '../../../src/domain/univers/univers';
import { DefiStatus } from '../../../src/domain/defis/defi';
import { DefiStatistiqueUsecase } from '../../../src/usecase/defiStatistique.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Defis')
export class DefisController extends GenericControler {
  constructor(
    private readonly defisUsecase: DefisUsecase,
    private readonly defiStatistiqueUsecase: DefiStatistiqueUsecase,
  ) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/defis/:defiId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: DefiAPI,
  })
  @ApiOperation({
    summary: 'Retourne un defis fonction de son ID',
  })
  async getById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('defiId') defiId: string,
  ): Promise<DefiAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getById(utilisateurId, defiId);
    const resultDefiStatistique = await this.defiStatistiqueUsecase.getById(
      defiId,
    );
    return DefiAPI.mapToAPI(result, resultDefiStatistique);
  }

  @Patch('utilisateurs/:utilisateurId/defis/:defiId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: DefiAPI,
  })
  @ApiOperation({
    summary: `Met à jour le statut d'un défi`,
  })
  @ApiBody({
    type: PatchDefiStatusAPI,
  })
  async patchStatus(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('defiId') defiId: string,
    @Body() body: PatchDefiStatusAPI,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.defisUsecase.updateStatus(
      utilisateurId,
      defiId,
      body.status,
      body.motif,
    );
  }

  @Get('utilisateurs/:utilisateurId/defis_v2')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [DefiAPI],
  })
  @ApiOperation({
    summary:
      "Retourne l'ensemble des défis de l'utilisateur, aggrégation des défis dispo via les différents univers / thémtiques",
  })
  async getAllUserDefi_2(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getAllDefis_v2(utilisateurId);
    return result.map((element) => DefiAPI.mapToAPI(element));
  }

  @Get('utilisateurs/:utilisateurId/defis')
  @ApiQuery({
    name: 'univers',
    enum: Univers,
    required: false,
    description: `filtrage par univers, un id d'univers, eg : 'climat'`,
  })
  @ApiQuery({
    name: 'accessible',
    type: Boolean,
    required: false,
    description: `'true' indique que l'on ne souhaite que les défis dis "accessibles", c'est a dire débloqués`,
  })
  @ApiQuery({
    name: 'status',
    enum: DefiStatus,
    enumName: 'status',
    isArray: true,
    required: false,
    description: `filtrage par status, plusieur status possible avec la notation ?status=XXX&status=YYY`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [DefiAPI],
  })
  @ApiOperation({
    summary:
      "Retourne l'ensemble des défis de l'utilisateur (en cours, fait, abandonné, etc)",
  })
  async getAllUserDefi(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('status') status,
    @Query('univers') univers: Univers,
    @Query('accessible') accessible: string,
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getALLUserDefi(
      utilisateurId,
      status ? status : [],
      univers ? Univers[univers] : undefined,
      accessible === 'true',
    );
    return result.map((element) => DefiAPI.mapToAPI(element));
  }

  @Get('utilisateurs/:utilisateurId/univers/:universId/defis')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [DefiAPI],
  })
  @ApiOperation({
    summary:
      "Retourne l'ensemble des défis de l'utilisateur visible dans l'univers argument, agrégation des défis visibles des thémtiques de cet univers",
  })
  async getAllUserDefiInUnivers(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('universId') universId: string,
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getDefisOfUnivers(
      utilisateurId,
      Univers[universId],
    );
    return result.map((element) => DefiAPI.mapToAPI(element));
  }
}
