import {
  Controller,
  Get,
  Headers,
  Res,
  HttpStatus,
  Request,
  Query,
  ForbiddenException,
  UnauthorizedException,
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
import { Response } from 'express';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { WinterListeSubAPI } from './types/winter/WinterListeSubAPI';
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
    name: 'end_date',
    type: Date,
    required: false,
  })
  @ApiOkResponse({ type: [LinkyDataAPI] })
  @UseGuards(AuthGuard)
  async getData(
    @Request() req,
    @Res() res: Response,
    @Param('utilisateurId') utilisateurId: string,
    @Query('detail') detail?: LinkyDataDetailAPI,
    @Query('nombre') nombre?: number,
    @Query('compare_annees') compare_annees?: boolean,
    @Query('compare_mois_sem_jour') compare_mois_sem_jour?: boolean,
    @Query('end_date') end_date?: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    const data = await this.linkyUsecase.getUserData(
      utilisateurId,
      detail,
      nombre,
      end_date,
      compare_annees,
      compare_mois_sem_jour,
    );
    const result = data.serie.map((elem) => LinkyDataAPI.map(elem));

    res.status(HttpStatus.OK).json(result).send();
  }
}
