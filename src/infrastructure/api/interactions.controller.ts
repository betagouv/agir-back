import { Utilisateur } from '.prisma/client';
import { Body, Controller, Get, NotFoundException, Param, Post, Query, Response } from '@nestjs/common';
import { InteractionsUsecase } from '../../usecase/interactions.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { APIInteractionType } from './types/interaction';

@Controller()
@ApiTags('Interactions')
export class IntractionsController {
  constructor(private readonly interactionsUsecase: InteractionsUsecase) {}

  @Get('utilisateurs/:id/interactions')
  async getUserInteractions(@Param('id') id:string): Promise<APIInteractionType[]> {
    return this.interactionsUsecase.listInteractions(id);
  }
}
