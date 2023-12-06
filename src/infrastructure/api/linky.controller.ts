import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Res,
  HttpStatus,
  Query,
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
import { ApplicationError } from '../applicationError';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { WinterListeSubAPI } from './types/winter/WinterListeSubAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Linky')
export class LinkyController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
  }

  @Post('utilisateurs/:utilisateurId/linky_souscription')
  @ApiOperation({
    summary:
      'déclenche une souscription auprès des données linky, avec le PRM déclaré dans le profile de l utilisateur',
  })
  @UseGuards(AuthGuard)
  async souscription(
    @Param('utilisateurId') utilisateurId: string,
    @Res() res: Response,
    @Request() req,
    @Query('prm') prm: string,
    @Query('code_departement') code_departement: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    let result;
    try {
      result = await this.linkyUsecase.souscription(
        utilisateurId,
        prm,
        code_departement,
      );
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
    res.status(HttpStatus.OK).json(result).send();
  }
  @Get('linky_souscriptions')
  @ApiOperation({
    summary: 'Consulte les souscriptions actives',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
  })
  @ApiOkResponse({ type: WinterListeSubAPI })
  @UseGuards(AuthGuard)
  async get_souscriptions(@Res() res: Response, @Query('page') page?: number) {
    let result;
    try {
      result = await this.linkyUsecase.liste_souscriptions(page);
    } catch (error) {
      ApplicationError.throwBadRequestOrServerError(error);
    }
    res.status(HttpStatus.OK).json(result).send();
  }
}
