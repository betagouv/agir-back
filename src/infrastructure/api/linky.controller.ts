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
import { LinkyDataAPI } from './types/service/linkyDataAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Linky')
export class LinkyController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
  }

  @Get('/linky/souscriptions')
  @ApiOperation({
    summary: 'Consulte les souscriptions actives',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiOkResponse({ type: WinterListeSubAPI })
  async get_souscriptions(
    @Headers('Authorization') authorization: string,
    @Res() res: Response,
    @Query('page') page?: number,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    let result = await this.linkyUsecase.liste_souscriptions(page);
    res.status(HttpStatus.OK).json(result).send();
  }
  @Get('/utilisateurs/:utilisateurId/linky')
  @ApiOperation({
    summary: `renvoie les données linky de utilisateur`,
  })
  @ApiOkResponse({ type: [LinkyDataAPI] })
  @UseGuards(AuthGuard)
  async getDataa(
    @Request() req,
    @Res() res: Response,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    const data = await this.linkyUsecase.getUserData(utilisateurId);
    const result = data.serie.map((elem) => LinkyDataAPI.map(elem));

    res.status(HttpStatus.OK).json(result).send();
  }
}
