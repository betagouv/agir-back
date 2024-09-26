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
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { RechercheServicesUsecase } from '../../../src/usecase/rechercheServices.usecase';
import { RechercheServiceInputAPI } from './types/rechercheServices/rechercheServiceInputAPI';
import { ServiceRechercheID } from '../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { ResultatRechercheAPI } from './types/rechercheServices/resultatRecherchAPI';
import { CategoriesRechercheAPI } from './types/rechercheServices/categoriesRechercheAPI';
import { CategorieRecherche } from '../../domain/bibliotheque_services/recherche/categorieRecherche';
import { FiltreRecherche } from '../../domain/bibliotheque_services/recherche/filtreRecherche';
import { ApplicationError } from '../applicationError';
import { ServiceRechercheAPI } from './types/rechercheServices/serviceRechercheAPI';

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
    summary: `recherche une categorie au sein d'un service de recherche donné`,
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

    if (body.categorie && !CategorieRecherche[body.categorie]) {
      ApplicationError.throwUnkonwnCategorie(body.categorie);
    }
    const filtre = {
      categorie: CategorieRecherche[body.categorie],
      point: body.longitude
        ? { latitude: body.latitude, longitude: body.longitude }
        : undefined,
      nombre_max_resultats: body.nombre_max_resultats,
      rayon_metres: body.rayon_metres,
      distance_metres: body.distance_metres,
    };

    if (body.latitude_depart) {
      filtre['rect_A'] = {
        latitude: body.latitude_depart,
        longitude: body.longitude_depart,
      };
    }
    if (body.latitude_arrivee) {
      filtre['rect_B'] = {
        latitude: body.latitude_arrivee,
        longitude: body.longitude_arrivee,
      };
    }

    const result = await this.rechercheServicesUsecase.search(
      utilisateurId,
      ServiceRechercheID[serviceId],
      new FiltreRecherche(filtre),
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

  @Get('utilisateurs/:utilisateurId/recherche_services/:universId')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Liste des service disponible dans un univers donné`,
  })
  @ApiOkResponse({
    type: [ServiceRechercheAPI],
  })
  async getListeServices(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('universId') universId: string,
  ): Promise<ServiceRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.getListServiceDef(
      utilisateurId,
      universId,
    );
    return result.map((r) => ServiceRechercheAPI.mapToAPI(r));
  }

  @Get('utilisateurs/:utilisateurId/recherche_services')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Liste des service disponible sur la home`,
  })
  @ApiOkResponse({
    type: [ServiceRechercheAPI],
  })
  async getListeServicesHome(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<ServiceRechercheAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.getListServiceDefHome(
      utilisateurId,
    );
    return result.map((r) => ServiceRechercheAPI.mapToAPI(r));
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

  @Get(
    'utilisateurs/:utilisateurId/recherche_services/:serviceId/last_results/:resultId',
  )
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: `Récupère la fiche détaillée d'un résultat d'une recherche qui vient d'être effectuée`,
  })
  @ApiOkResponse({
    type: ResultatRechercheAPI,
  })
  @ApiParam({ name: 'serviceId', enum: ServiceRechercheID })
  async getDetailResultat(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Param('resultId') resultId: string,
  ): Promise<ResultatRechercheAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.rechercheServicesUsecase.getResultRechercheDetail(
      utilisateurId,
      ServiceRechercheID[serviceId],
      resultId,
    );
    return ResultatRechercheAPI.mapToAPI(result);
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
