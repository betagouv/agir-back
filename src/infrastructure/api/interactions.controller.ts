import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Request,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { InteractionAPI } from './types/interaction/interactionAPI';
import { InteractionStatus } from '../../domain/interaction/interactionStatus';
import { Thematique } from '../../domain/thematique';
import { InteractionStatusAPI } from './types/interaction/interactionStatusAPI';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';

@Controller()
@ApiTags('Interactions')
export class IntractionsController extends GenericControler {
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
      // FIXME : to remove
      new_inter['categorie'] = inter.thematique_gamification;
      // FIXME : to remove
      new_inter['reco_score'] = 666;
      return new_inter;
    });
  }
  @Patch('utilisateurs/:utilisateurId/interactions/:interactionId')
  @UseGuards(AuthGuard)
  async patchInteractionStatus(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('interactionId') interactionId: string,
    @Body() body: InteractionStatusAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    const status: InteractionStatus = {
      seen: body.seen,
      clicked: body.clicked,
      done: body.done,
      quizz_score: body.quizz_score,
    };

    await this.interactionsUsecase.updateStatus(
      utilisateurId,
      interactionId,
      status,
    );
  }
  @ApiQuery({
    name: 'date',
    type: Date,
    description: 'date seuil de reset, eg 2023-03-19',
    required: false,
  })
  @Post('interactions/reset')
  async resetInteractions(@Res() res: Response, @Query('date') date?: string) {
    const result = await this.interactionsUsecase.reset(
      date ? new Date(Date.parse(date)) : null,
    );
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
