import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Post,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { TodoAPI } from './types/todo/todoAPI';
import { TodoUsecase } from '../../usecase/todo.usecase';
import { Response } from 'express';
import { ApplicationError } from '../applicationError';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';

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
  ) {
    this.checkCallerId(req, utilisateurId);

    const result = await this.linkyUsecase.souscription(utilisateurId);

    res.status(HttpStatus.OK).json('ok').send();
  }
}
