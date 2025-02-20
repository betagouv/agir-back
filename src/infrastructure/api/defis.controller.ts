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
import { DefiStatus } from '../../../src/domain/defis/defi';
import { DefiStatistiqueUsecase } from '../../../src/usecase/stats/defiStatistique.usecase';
import { Thematique } from '../../domain/contenu/thematique';

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
      "Retourne l'ensemble des défis de l'utilisateur débloqués dans des missions, filtrage par status disponible, tout status sauf todo par défaut",
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    required: false,
    description: `filtrage par une thematique`,
  })
  @ApiQuery({
    name: 'status',
    enum: DefiStatus,
    enumName: 'status',
    isArray: true,
    required: false,
    description: `filtrage par status, plusieur status possible avec la notation ?status=XXX&status=YYY`,
  })
  async getAllUserDefi_2(
    @Request() req,
    @Query('status') status: string[] | string,
    @Query('thematique') thematique: string,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    let them;
    if (thematique) {
      them = this.castThematiqueOrException(thematique);
    }
    const result = await this.defisUsecase.getAllDefis_v2(
      utilisateurId,
      them,
      this.getStringListFromStringArrayAPIInput(status),
    );
    return result.map((element) => DefiAPI.mapToAPI(element));
  }
}
