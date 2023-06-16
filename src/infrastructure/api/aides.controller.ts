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
  @Get('retrofit/citoyens/:id')
  async getAide(@Param('id') id): Promise<any> {
    const aides = await this.aidesUsecase.getRetrofitCitoyen(Number(id));
    if (aides == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return aides;
  }
}
