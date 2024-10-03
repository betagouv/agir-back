import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
  Redirect,
} from '@nestjs/common';
import { BilanUsecase } from '../../usecase/bilan.usecase';
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { App } from '../../domain/app';
import { ThrottlerGuard } from '@nestjs/throttler';

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
  @ApiBody({ type: SituationNGCAPI })
  @Post('bilan/importFromNGC')
  @Redirect('https://front-jagis.beta.gouv.fr', 302)
  @UseGuards(ThrottlerGuard)
  async importFromNGC(@Body() body: SituationNGCAPI) {
    const id = await this.bilanUsecase.addSituation(body.situation);
    return {
      url: `${App.getBaseURLFront()}/creation-compte?situatio_id=${id}`,
    };
  }
}
