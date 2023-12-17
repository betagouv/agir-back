import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { SuiviDashboardAPI } from './types/suivi/suiviDashboardAPI';
import {
  SuiviAlimentationAPI,
  SuiviTransportAPI,
} from './types/suivi/suiviAPI';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';

@Controller()
@ApiExtraModels(SuiviAlimentationAPI, SuiviTransportAPI, SuiviDashboardAPI)
@ApiBearerAuth()
@ApiTags('Suivi Dashboard')
export class SuiviDashboardController extends GenericControler {
  constructor(private readonly suiviUsecase: SuiviUsecase) {
    super();
  }

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
  @ApiOperation({
    summary:
      'Données aggrégées de suivi alimentation et transport : dernier suivi et tendance',
  })
  @Get('utilisateurs/:id/suivi_dashboard')
  @UseGuards(AuthGuard)
  async getSuiviDashboard(
    @Request() req,
    @Param('id') id: string,
  ): Promise<SuiviDashboardAPI> {
    this.checkCallerId(req, id);
    return this.suiviUsecase.buildSuiviDashboard(id);
  }
}
