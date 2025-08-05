import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdresseUsecase } from '../../usecase/adresse.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import {
  AdressesRecentesAPI,
  AdressesRecentesInputAPI,
} from './types/utilisateur/adressesRecentesAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('1 - Utilisateur - Profile')
export class AdressesController extends GenericControler {
  constructor(private readonly adresseUsecase: AdresseUsecase) {
    super();
  }

  @ApiOkResponse({ type: [AdressesRecentesAPI] })
  @Get('utilisateurs/:utilisateurId/adresses_recentes')
  @ApiOperation({
    summary: "Liste les adresses récemment saisies par l'utilisateur",
  })
  @UseGuards(AuthGuard)
  async getUtilisateurAdressesRecentes(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<AdressesRecentesAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const adresses = await this.adresseUsecase.getListeAdressesRecentes(
      utilisateurId,
    );
    return adresses.map((a) => AdressesRecentesAPI.mapToAPI(a));
  }

  @Post('utilisateurs/:utilisateurId/adresses_recentes')
  @ApiOperation({
    summary: `Crée une nouvelle adresse récente, 5 adresses max possible, renvoie la nouvelle liste des adresses récentes en stock`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: [AdressesRecentesAPI] })
  async createAdresseRecente(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: AdressesRecentesInputAPI,
  ): Promise<AdressesRecentesAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const new_liste = await this.adresseUsecase.addAdressesRecentes(
      utilisateurId,
      {
        ...body,
        date_creation: undefined,
      },
    );

    return new_liste.map((a) => AdressesRecentesAPI.mapToAPI(a));
  }
  @Delete('utilisateurs/:utilisateurId/adresses_recentes/:idAdresse')
  @ApiOkResponse({ type: [AdressesRecentesAPI] })
  @ApiOperation({
    summary: `Supprime une adresse récente, renvoie la nouvelle liste d'adresse récente en stock`,
  })
  @UseGuards(AuthGuard)
  async deleteAdresseRecente(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('idAdresse') idAdresse: string,
  ): Promise<AdressesRecentesAPI[]> {
    this.checkCallerId(req, utilisateurId);

    const new_liste = await this.adresseUsecase.supprimeAdresseRecente(
      utilisateurId,
      idAdresse,
    );

    return new_liste.map((a) => AdressesRecentesAPI.mapToAPI(a));
  }
}
