import { Controller, Get, Param } from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Suivi Dashboard')
export class SuiviDashboardController {
  constructor(private readonly suiviUsecase: SuiviUsecase) {}

  @Get('utilisateurs/:id/suivi_dashboard')
  async getSuiviDashboard(@Param('id') id: string): Promise<any> {
    return this.suiviUsecase.buildSuiviDashboard(id);
  }
}
