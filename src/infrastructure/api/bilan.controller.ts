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
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';

@Controller()
@ApiBearerAuth()
@ApiTags('Bilan --- OLD --- ')
export class BilanController extends GenericControler {
  constructor(private readonly bilanUsecase: BilanUsecase) {
    super();
  }

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
