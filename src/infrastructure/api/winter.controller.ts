import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller()
@ApiTags('Incoming Data')
export class WinterController {
  constructor() {}
  @ApiBody({ type: Object })
  @Post('incoming/winter-energies')
  async income(@Body() body: object, @Res() res: Response, @Headers() headers) {
    console.log(JSON.stringify(headers));
    console.log(JSON.stringify(body));
    res.status(HttpStatus.OK).json({ message: 'Received OK !' }).send();
  }
}
