import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';
import { BilanCarboneAPI } from './types/ngc/bilanAPI';
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan')
export class BilanController extends GenericControler {
  constructor(
    private readonly bilanUsecase: BilanUsecase,
    private readonly bilanCarboneUsecase: BilanCarboneUsecase,
  ) {
    super();
  }
  @ApiOkResponse({ type: BilanCarboneAPI })
  @Get('utilisateur/:utilisateurId/bilans/last')
  @UseGuards(AuthGuard)
  async getBilan(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanCarboneAPI> {
    this.checkCallerId(req, utilisateurId);
    const bilan = await this.bilanCarboneUsecase.getCurrentBilanByUtilisateurId(
      utilisateurId,
    );
    return BilanCarboneAPI.mapToAPI(bilan);
  }

  /*
  @Get('utilisateur/:utilisateurId/bilans')
  @ApiOkResponse({ type: BilanAPI })
  @UseGuards(AuthGuard)
  async getBilans(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BilanAPI[]> {
    this.checkCallerId(req, utilisateurId);
    return this.bilanUsecase.getAllBilansByUtilisateurId(utilisateurId);
  }
  */

  @Post('utilisateurs/:utilisateurId/bilans/:situationId')
  @UseGuards(AuthGuard)
  async postEmpreinte(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('situationId') situationId: string,
  ): Promise<any> {
    this.checkCallerId(req, utilisateurId);
    return await this.bilanUsecase.addBilanToUtilisateur(
      utilisateurId,
      situationId,
    );
  }

  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @Post('bilan/importFromNGC')
  async importFromNGC(
    @Body() body: { situation: object },
  ): Promise<SituationNGCAPI> {
    // todo : check situation for security
    const result = await this.bilanUsecase.addSituation(body.situation);
    return result as SituationNGCAPI;
  }
}
