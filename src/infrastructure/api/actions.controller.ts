import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ActionAPI } from './types/actions/ActionAPI';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Thematique } from '../../domain/contenu/thematique';
import { ActionLightAPI } from './types/actions/ActionLightAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Actions')
export class ActionsController extends GenericControler {
  constructor(private readonly actionUsecase: ActionUsecase) {
    super();
  }

  @Get('actions')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @ApiOkResponse({
    type: [ActionLightAPI],
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions`,
  })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    required: false,
    description: `filtrage par une thematique`,
  })
  async getCatalogue(
    @Query('thematique') thematique: string,
  ): Promise<ActionLightAPI[]> {
    let them;
    if (thematique) {
      them = this.castThematiqueOrException(thematique);
    }
    const result = await this.actionUsecase.getOpenCatalogue(them);
    return result.map((r) => ActionLightAPI.mapToAPI(r));
  }
  @Get('actions/:code')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  @ApiOkResponse({
    type: ActionAPI,
  })
  @ApiOperation({
    summary: `Retourne une action précise`,
  })
  async getAction(@Param('code') code: string): Promise<ActionAPI> {
    const result = await this.actionUsecase.getAction(code);
    return ActionAPI.mapToAPI(result);
  }
}
