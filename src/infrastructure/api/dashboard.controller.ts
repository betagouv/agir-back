import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GenerateDashboardUsecase } from '../../usecase/generate_dashboard.usecase';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Dashboard')
export class DashboardController {
  constructor(
    private readonly generateDashboardUsecase: GenerateDashboardUsecase,
  ) {}

  @Get('dashboards/:utilisateurId')
  async getDashboardsById(
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<Object> {
    return this.generateDashboardUsecase.doIt(utilisateurId);
  }
}
