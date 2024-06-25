import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Param,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RechercheServicesUsecase } from '../../../src/usecase/rechercheServices.usecase';
import { RechercheServiceInputAPI } from './types/rechercheServices/addServiceAPI';
import { ServiceRechercheID } from '../../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRechercheAPI } from './types/rechercheServices/resultatRecherchAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Univers')
export class RechecheServicesController extends GenericControler {
  constructor(private rechercheServicesUsecase: RechercheServicesUsecase) {
    super();
  }

  @Post('utilisateurs/:utilisateurId/recherche_services/:serviceId/search')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'recherche un text donné sur un service donné',
  })
  @ApiBody({
    type: RechercheServiceInputAPI,
  })
  async getUnivers(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: RechercheServiceInputAPI,
  ): Promise<ResultatRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.search(
      utilisateurId,
      ServiceRechercheID[serviceId],
      body.text,
    );
    return result.map((r) => ResultatRechercheAPI.mapToAPI(r));
  }
}
