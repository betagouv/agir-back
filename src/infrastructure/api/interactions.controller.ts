import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Request,
  Post,
  Res,
  UseGuards,
  Headers,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InteractionAPI } from './types/interaction/interactionAPI';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';

@Controller()
@ApiBearerAuth()
@ApiTags('Interactions')
export class InteractionsController extends GenericControler {
  constructor(private readonly interactionsUsecase: InteractionsUsecase) {
    super();
  }

  @Get('utilisateurs/:id/interactions')
  @ApiOkResponse({ type: [InteractionAPI] })
  @UseGuards(AuthGuard)
  async getUserInteractions(
    @Request() req,
    @Param('id') id: string,
  ): Promise<InteractionAPI[]> {
    this.checkCallerId(req, id);

    const list = await this.interactionsUsecase.listInteractions(id);
    return list.map((inter) => {
      const new_inter = new InteractionAPI();
      Object.assign(new_inter, inter);
      return new_inter;
    });
  }

  @Post('interactions/reset')
  async resetInteractions(
    @Res() res: Response,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    const result = await this.interactionsUsecase.reset();
    res.status(HttpStatus.OK).json({ reset_interaction_number: result }).send();
  }
}
