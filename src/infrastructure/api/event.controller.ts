import {
  Controller,
  Param,
  UseGuards,
  Request,
  Res,
  Body,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { EventUsecase } from '../../../src/usecase/event.usecase';
import { EventAPI } from './types/event/eventAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Events')
export class EventController extends GenericControler {
  constructor(private readonly eventUsecase: EventUsecase) {
    super();
  }

  @Post('utilisateurs/:utilisateurId/events')
  @ApiOperation({
    summary: "enregistre un évènement pour l'utilisateur",
  })
  @ApiBody({
    type: EventAPI,
  })
  @UseGuards(AuthGuard)
  async getProcessEvent(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
    @Body() body: EventAPI,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.eventUsecase.processEvent(utilisateurId, body);
  }
}
