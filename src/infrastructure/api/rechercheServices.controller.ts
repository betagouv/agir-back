import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
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
  Put,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RechercheServicesUsecase } from '../../../src/usecase/rechercheServices.usecase';
import { RechercheServiceInputAPI } from './types/rechercheServices/rechercheServiceInputAPI';
import { ServiceRechercheID } from '../../../src/domain/bibliotheque_services/serviceRechercheID';
import { ResultatRechercheAPI } from './types/rechercheServices/resultatRecherchAPI';
import { CategoriesRechercheAPI } from './types/rechercheServices/categoriesRechercheAPI';

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
  @ApiOkResponse({
    type: [ResultatRechercheAPI],
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
      body.rayon_metres,
      body.nombre_max_resultats,
    );
    return result.map((r) => ResultatRechercheAPI.mapToAPI(r));
  }

  @Get('utilisateurs/:utilisateurId/recherche_services/:serviceId/favoris')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Récupère les favoris de l'utilisateur`,
  })
  @ApiOkResponse({
    type: [ResultatRechercheAPI],
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

  @Get('utilisateurs/:utilisateurId/recherche_services/:serviceId/categories')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Récupère les categories disponibles sur un service donné`,
  })
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  @ApiOkResponse({
    type: [CategoriesRechercheAPI],
  })
  async getCategories(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<CategoriesRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.getCategories(
      utilisateurId,
      ServiceRechercheID[serviceId],
    );
    return result.map((r) => CategoriesRechercheAPI.mapToAPI(r));
  }

  @Post(
    'utilisateurs/:utilisateurId/recherche_services/:serviceId/last_results/:resultId/add_to_favoris',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Ajoute aux favoris le resultat d'id donné`,
  })
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  async postFavoris(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Param('resultId') resultId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.rechercheServicesUsecase.ajouterFavoris(
      utilisateurId,
      ServiceRechercheID[serviceId],
      resultId,
    );
  }

  @Delete(
    'utilisateurs/:utilisateurId/recherche_services/:serviceId/favoris/:favId',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Supprime un favoris d'un service donné`,
  })
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  async deleteFavoris(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Param('favId') favId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.rechercheServicesUsecase.supprimerFavoris(
      utilisateurId,
      ServiceRechercheID[serviceId],
      favId,
    );
  }
}
