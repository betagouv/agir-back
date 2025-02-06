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
import { ActionAPI } from './types/defis/ActionAPI';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller()
@ApiBearerAuth()
@ApiTags('Actions')
export class ActionsController extends GenericControler {
  constructor(private readonly actionUsecase: ActionUsecase) {
    super();
  }

  @Get('actions')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 1000 } })
  @ApiOkResponse({
    type: [ActionAPI],
  })
  @ApiOperation({
    summary: `Retourne le catalogue d'actions`,
  })
  async getCatalogue(@Request() req): Promise<ActionAPI[]> {
    const result = await this.actionUsecase.getOpenCatalogue();
    return result.map((r) => ActionAPI.mapToAPI(r));
  }
}
