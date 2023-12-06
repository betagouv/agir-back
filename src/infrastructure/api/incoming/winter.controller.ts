import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Headers,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ApplicationError } from '../../../../src/infrastructure/applicationError';
import { LinkyUsecase } from '../../../../src/usecase/linky.usecase';
import { WinterDataSentAPI } from '../types/winter/WinterIncomingDataAPI';

@Controller()
@ApiTags('Incoming Data')
export class WinterController {
  constructor(private readonly linkyUsecase: LinkyUsecase) {}
  @ApiBody({ type: WinterDataSentAPI })
  @Post('api/incoming/winter-energies')
  async income(
    @Body() body: WinterDataSentAPI,
    @Res() res: Response,
    @Headers() headers,
  ) {
    console.log(JSON.stringify(headers));
    if (headers['key'] !== process.env.WINTER_API_KEY) {
      throw new UnauthorizedException('clé API manquante ou incorrecte');
    }
    try {
      await this.linkyUsecase.process_incoming_data(body);
    } catch (error) {
      console.log(error);
      ApplicationError.throwBadRequestOrServerError(error);
    }
    res.status(HttpStatus.OK).json({ message: 'Received OK !' }).send();
  }
}
