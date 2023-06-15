import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AidesVeloUsecase } from '../../usecase/aidesVelo.usecase';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('AidesVelo')
export class AidesVeloController {
  constructor(private readonly aidesVeloUsecase: AidesVeloUsecase) {}
  @ApiExcludeEndpoint()
  @Get('retrofit/citoyens/:id')
  async getAide(@Param('id') id): Promise<any> {
    const aides = await this.aidesVeloUsecase.getAidesVeloByCitoyen(Number(id));
    if (aides == null) {
      throw new NotFoundException(`Pas de citoyen d'id ${id}`);
    }
    return aides;
  }
}
