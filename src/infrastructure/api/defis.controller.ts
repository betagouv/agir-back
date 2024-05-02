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
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { DefisUsecase } from '../../../src/usecase/defis.usecase';
import { DefiAPI, PatchDefiStatusAPI } from './types/defis/DefiAPI';
import { Univers } from '../../../src/domain/univers/univers';
import { DefiStatus } from '../../../src/domain/defis/defi';

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
  @ApiQuery({
    name: 'univers',
    enum: Univers,
    required: false,
    description: `filtrage par univers, un id d'univers, eg : 'climat'`,
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
  ): Promise<DefiAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.defisUsecase.getALLUserDefi(
      utilisateurId,
      status ? status : [],
      univers ? Univers[univers] : undefined,
    );
    return result.map((element) => DefiAPI.mapToAPI(element));
  }
}
