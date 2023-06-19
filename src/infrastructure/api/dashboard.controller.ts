import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { GenerateDashboardUsecase } from '../../usecase/generate_dashboard.usecase';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Dashboard')
export class DashboardController {
  constructor(private readonly generateDashboardUsecase: GenerateDashboardUsecase) {}

  @Get('dashboards/:username')
  async getDashboardsById(@Param('username') username:string): Promise<Object> {
      return this.generateDashboardUsecase.doIt(username);
  }
  // TODO : removve, for demo only
  @Get('dashboard/:username')
  async getDashboardById(@Param('username') username:string): Promise<Object> {
      return this.generateDashboardUsecase.doIt(username);
  }
}
