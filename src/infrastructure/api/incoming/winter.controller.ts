import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { App } from '../../../../src/domain/app';
import { LinkyUsecase } from '../../../../src/usecase/linky.usecase';
import { GenericControler } from '../genericControler';
import { WinterDataSentAPI } from '../types/winter/WinterIncomingDataAPI';

@Controller()
@ApiTags('Incoming Data')
export class WinterController extends GenericControler {
  constructor(private readonly linkyUsecase: LinkyUsecase) {
    super();
  }
  @ApiBody({ type: WinterDataSentAPI })
  @Post('api/incoming/winter-energies')
  async income(@Body() body: WinterDataSentAPI, @Headers() headers) {
    console.log(JSON.stringify(headers));
    if (headers['key'] !== App.getWinterAPIKey()) {
      throw new UnauthorizedException('clé API manquante ou incorrecte');
    }
    await this.linkyUsecase.process_incoming_data(body);
  }
}
