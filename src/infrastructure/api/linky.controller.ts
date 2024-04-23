import {
  Controller,
  Get,
  Request,
  Query,
  UseGuards,
  Param,
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
    name: 'detail',
    enum: LinkyDataDetailAPI,
    required: false,
  })
  @ApiQuery({
    name: 'nombre',
    type: Number,
    required: false,
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
  @ApiQuery({
    name: 'end_date',
    type: Date,
    required: false,
  })
  @ApiOkResponse({ type: LinkyDataAPI })
  @UseGuards(AuthGuard)
  async getData(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('detail') detail?: LinkyDataDetailAPI,
    @Query('nombre') nombre?: number,
    @Query('compare_annees') compare_annees?: string,
    @Query('end_date') end_date?: string,
    @Query('derniers_14_jours') derniers_14_jours?: string,
  ): Promise<LinkyDataAPI> {
    this.checkCallerId(req, utilisateurId);

    const data = await this.linkyUsecase.getUserData(
      utilisateurId,
      detail,
      nombre,
      end_date,
      compare_annees === 'true',
      derniers_14_jours === 'true',
    );
    return LinkyDataAPI.map(data.data.serie, data.commentaires);
  }
}
