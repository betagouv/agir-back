import { Controller, Get, Param } from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SuiviDashboardAPI } from './types/suiviDashboardAPI';
import { SuiviAlimentationAPI, SuiviTransportAPI } from './types/suiviAPI';

@Controller()
@ApiExtraModels(SuiviAlimentationAPI, SuiviTransportAPI, SuiviDashboardAPI)
@ApiTags('Suivi Dashboard')
export class SuiviDashboardController {
  constructor(private readonly suiviUsecase: SuiviUsecase) {}

  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(SuiviDashboardAPI) },
        {
          properties: {
            dernier_suivi: {
              allOf: [
                { $ref: getSchemaPath(SuiviAlimentationAPI) },
                { $ref: getSchemaPath(SuiviTransportAPI) },
              ],
            },
          },
        },
      ],
    },
  })
  @Get('utilisateurs/:id/suivi_dashboard')
  async getSuiviDashboard(@Param('id') id: string): Promise<SuiviDashboardAPI> {
    return this.suiviUsecase.buildSuiviDashboard(id);
  }
}
