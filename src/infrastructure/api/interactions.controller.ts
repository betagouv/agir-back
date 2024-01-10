import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Request,
  Post,
  Query,
  Res,
  UseGuards,
  Headers,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import {
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InteractionAPI } from './types/interaction/interactionAPI';
import { InteractionStatus } from '../../domain/interaction/interactionStatus';
import { Thematique } from '../../domain/thematique';
import { InteractionStatusAPI } from './types/interaction/interactionStatusAPI';
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
  @ApiQuery({
    name: 'utilisateurId',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'boost',
    type: Number,
    required: true,
    description: 'un nombre plus petit que -1 ou plus grand que 1',
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    required: true,
  })
  @Post('interactions/scoring')
  async boostInteractions(
    @Request() req,
    @Query('utilisateurId') utilisateurId: string,
    @Query('boost') boost: number,
    @Query('thematique') thematique: Thematique,
  ) {
    return this.interactionsUsecase.updateInteractionScoreByCategories(
      utilisateurId,
      [thematique],
      boost,
    );
  }
}
