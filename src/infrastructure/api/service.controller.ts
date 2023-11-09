import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { ServiceDefinitionAPI } from './types/service/serviceDefinitionAPI';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { AddServiceAPI } from './types/service/addServiceAPI';
import { ErrorService } from '../errorService';
import { ServiceAPI } from './types/service/serviceAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Services')
export class ServiceController extends GenericControler {
  constructor(private readonly serviceUsecase: ServiceUsecase) {
    super();
  }

  @Get('services')
  @ApiOperation({
    summary: "Liste l'ensemble des services disponibles dans l'application",
  })
  @ApiQuery({
    name: 'utilisateurId',
    type: String,
    description: `Permet d'indiquer pour chaque service du catalogue si celui est installé pour l'utlisateur de cet id, champ optionnel`,
    required: false,
  })
  @ApiOkResponse({ type: [ServiceDefinitionAPI] })
  @UseGuards(AuthGuard)
  async listeServicesDef(
    @Query('utilisateurId') utilisateurId?: string,
  ): Promise<ServiceDefinitionAPI[]> {
    const result = await this.serviceUsecase.listServicesDefinitions(
      utilisateurId,
    );
    return result.map((def) =>
      ServiceDefinitionAPI.mapServiceDefintionToServiceDefinitionAPI(def),
    );
  }
  @Post('utilisateurs/:utilisateurId/services')
  @ApiOperation({
    summary: "Ajoute un service provenant du catalogue à l'utilisateur donné",
  })
  @ApiBody({
    type: AddServiceAPI,
  })
  @UseGuards(AuthGuard)
  async addServiceToUtilisateur(
    @Body() body: AddServiceAPI,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    try {
      return await this.serviceUsecase.addServiceToUtilisateur(
        utilisateurId,
        body.service_definition_id,
      );
    } catch (error) {
      throw new BadRequestException(ErrorService.toStringOrObject(error));
    }
  }
  @Get('utilisateurs/:utilisateurId/services')
  // FIXME : set cache-control
  @ApiOperation({
    summary: "Liste tous les services associés à l'utilisateur",
  })
  @ApiOkResponse({ type: [ServiceAPI] })
  @UseGuards(AuthGuard)
  async listServicesOfUtilisateur(
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    const result = await this.serviceUsecase.listeServicesOfUtilisateur(
      utilisateurId,
    );

    return result.map((service) =>
      ServiceAPI.mapServicesToServicesAPI(service),
    );
  }
  @Delete('utilisateurs/:utilisateurId/services/:serviceId')
  @ApiOperation({
    summary: "Supprime un service d'id donné associé à l'utilisateur",
  })
  @UseGuards(AuthGuard)
  async deleteServiceFromUtilisateur(
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    return await this.serviceUsecase.removeServiceFromUtilisateur(
      utilisateurId,
      serviceId,
    );
  }
}
