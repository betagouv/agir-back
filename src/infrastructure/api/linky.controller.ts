import {
  Controller,
  Get,
  Request,
  Query,
  UseGuards,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { LinkyDataAPI, LinkyDataDetailAPI } from './types/service/linkyDataAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Linky')
export class LinkyController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
  }

  @Get('/utilisateurs/:utilisateurId/linky')
  @ApiOperation({
    summary: `renvoie les données linky de utilisateur`,
  })
  @ApiQuery({
    name: 'compare_annees',
    type: Boolean,
    required: false,
  })
  @ApiQuery({
    name: 'derniers_14_jours',
    type: Boolean,
    required: false,
  })
  @ApiOkResponse({ type: LinkyDataAPI })
  @UseGuards(AuthGuard)
  async getData(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('compare_annees') compare_annees?: string,
    @Query('derniers_14_jours') derniers_14_jours?: string,
  ): Promise<LinkyDataAPI> {
    this.checkCallerId(req, utilisateurId);

    const data = await this.linkyUsecase.getUserData(
      utilisateurId,
      compare_annees === 'true',
      derniers_14_jours === 'true',
    );
    return LinkyDataAPI.map(data.data.serie, data.commentaires);
  }

  @ApiTags('Admin')
  @Post('/admin/linky_stats')
  @ApiOperation({
    summary: `Calcul les stats de reception linky sur le dernier mois, utiliser ensuite par exemple https://konklone.io/json/ pour convertir en CSV si besoin`,
  })
  async linky_stats(@Request() req): Promise<string[][]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.linkyUsecase.computeLastMonthDataQualiy();
  }
}
