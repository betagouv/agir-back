import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Response,
  Request,
  Get,
  HttpStatus,
  UseFilters,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { DefisUsecase } from '../../../src/usecase/defis.usecase';
import { DefiAPI, PatchDefiStatusAPI } from './types/defis/DefiAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Defis')
export class DefisController extends GenericControler {
  constructor(private readonly defisUsecase: DefisUsecase) {
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
    return DefiAPI.mapToAPI(result);
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
    await this.defisUsecase.updateStatus(utilisateurId, defiId, body.status);
  }

  @Get('defis')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [DefiAPI],
  })
  @ApiOperation({
    summary: "Retourne l'ensemble des défis du catalogue",
  })
  async getAll(@Request() req): Promise<DefiAPI[]> {
    const result = await this.defisUsecase.getALL();
    return result.map((element) => DefiAPI.mapToAPI(element));
  }

  @Get('utilisateurs/:utilisateurId/defis')
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
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getALLUserDefi(utilisateurId);
    return result.map((element) => DefiAPI.mapToAPI(element));
  }
}
