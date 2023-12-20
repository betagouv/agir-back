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
  Delete,
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

  @Delete('utilisateurs/:utilisateurId/linky_souscription')
  @ApiOperation({
    summary:
      'Supprime complètement une souscription linky et les données associées',
  })
  @UseGuards(AuthGuard)
  async delete(
    @Param('utilisateurId') utilisateurId: string,
    @Res() res: Response,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);
    this.checkCallerIsAdmin(req);
    await this.linkyUsecase.supprimeSouscription(utilisateurId);
    res.status(HttpStatus.OK).json('Souscription supprimée').send();
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
    this.checkCallerIsAdmin(req);
    let result = await this.linkyUsecase.souscription(
      utilisateurId,
      prm,
      code_departement,
    );
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
  async get_souscriptions(
    @Request() req,
    @Res() res: Response,
    @Query('page') page?: number,
  ) {
    this.checkCallerIsAdmin(req);
    let result = await this.linkyUsecase.liste_souscriptions(page);
    res.status(HttpStatus.OK).json(result).send();
  }
  @Post('linky_souscriptions/:prm/empty')
  @ApiOperation({
    summary:
      'Supprime les données associées au PRM, sans toucher la souscription',
  })
  @UseGuards(AuthGuard)
  async emptyPRM(
    @Request() req,
    @Res() res: Response,
    @Param('prm') prm: string,
  ) {
    this.checkCallerIsAdmin(req);
    await this.linkyUsecase.emptyPRMData(prm);
    res.status(HttpStatus.OK).send();
  }
}
