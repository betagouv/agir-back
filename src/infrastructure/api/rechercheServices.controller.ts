import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Param,
  UseGuards,
  Request,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RechercheServicesUsecase } from '../../../src/usecase/rechercheServices.usecase';
import { RechercheServiceInputAPI } from './types/rechercheServices/rechercheServiceInputAPI';
import { ServiceRechercheID } from '../../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRechercheAPI } from './types/rechercheServices/resultatRecherchAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Services Recherche (NEW)')
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
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  async recherche(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: ServiceRechercheID,
    @Body() body: RechercheServiceInputAPI,
  ): Promise<ResultatRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.search(
      utilisateurId,
      ServiceRechercheID[serviceId],
      body.categorie,
    );
    return result.map((r) => ResultatRechercheAPI.mapToAPI(r));
  }

  @Get('utilisateurs/:utilisateurId/recherche_services/:serviceId/favoris')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Récupère les favoris de l'utilisateur`,
  })
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  async getFavoris(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<ResultatRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.getFavoris(
      utilisateurId,
      ServiceRechercheID[serviceId],
    );
    return result.map((r) => ResultatRechercheAPI.mapToAPI(r));
  }
}
