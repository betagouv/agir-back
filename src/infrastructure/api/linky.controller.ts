import {
  Controller,
  Get,
  UseGuards,
  Request,
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
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { WinterListeSubAPI } from './types/winter/WinterListeSubAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Linky')
export class LinkyController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
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
}
