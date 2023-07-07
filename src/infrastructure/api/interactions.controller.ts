import { Utilisateur } from '.prisma/client';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { APIInteractionType } from './types/interaction';
import { InteractionStatus } from '../../../src/domain/interactionStatus';

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
}
