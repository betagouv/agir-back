import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { LinkyConfigurationAPI } from './types/service/linkyConfigurationAPI';
import { EquipementUsecase } from '../../../src/usecase/equipements.usecase';
import { VehiculeAPI } from './types/equipements/vehiculeAPI';

@ApiExtraModels(LinkyConfigurationAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('Equipements')
export class EquipementsController extends GenericControler {
  constructor(private readonly equipementUsecase: EquipementUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/vehicules')
  @ApiOperation({
    summary: "Liste l'ensemble des vehicules de l'utilisateur",
  })
  @ApiOkResponse({ type: [VehiculeAPI] })
  @UseGuards(AuthGuard)
  async listeVeehicules(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<VehiculeAPI[]> {
    if (utilisateurId) {
      this.checkCallerId(req, utilisateurId);
    }
    const result = await this.equipementUsecase.listerVehicules(utilisateurId);
    return result.map((veh) => VehiculeAPI.toAPI(veh));
  }

  @Put('utilisateurs/:utilisateurId/vehicules/:nom')
  @ApiOperation({
    summary: `Crée ou met à jour un vehicule de nom donné dans l'URL`,
  })
  @ApiBody({ type: VehiculeAPI })
  @UseGuards(AuthGuard)
  async setServiceConfiguration(
    @Body() body: VehiculeAPI,
    @Param('utilisateurId') utilisateurId: string,
    @Param('nom') nom: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.equipementUsecase.ajouterVehicule(utilisateurId, {
      ...body,
      nom: nom,
    });
  }
}
