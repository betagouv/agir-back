import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Aides')
export class AidesController {
  constructor(private readonly aidesUsecase: AidesUsecase) {}
  @ApiExcludeEndpoint()
  @Get('aides/retrofit')
  async getAide(): Promise<any> {
    const aides = await this.aidesUsecase.getRetrofit();
    if (aides == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return aides;
  }
}
