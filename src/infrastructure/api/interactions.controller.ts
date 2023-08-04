import { Utilisateur } from '.prisma/client';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { APIInteractionType } from './types/interaction';
import { InteractionStatus } from '../../domain/interaction/interactionStatus';

@Controller()
@ApiTags('Interactions')
export class IntractionsController {
  constructor(private readonly interactionsUsecase: InteractionsUsecase) {}

  @Get('utilisateurs/:id/interactions')
  async getUserInteractions(
    @Param('id') id: string,
  ): Promise<APIInteractionType[]> {
    return this.interactionsUsecase.listInteractions(id);
  }
  @Patch('utilisateurs/:utilisateurId/interactions/:interactionId')
  async patchInteractionStatus(
    @Param('utilisateurId') utilisateurId: string,
    @Param('interactionId') interactionId: string,
    @Body() body: any,
  ) {
    const status: InteractionStatus = {
      seen: body.seen,
      clicked: body.clicked,
      done: body.done,
      succeeded: body.succeeded,
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
}
