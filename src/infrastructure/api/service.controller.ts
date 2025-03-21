import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { ApplicationError } from '../applicationError';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { LinkyConfigurationAPI } from './types/service/linkyConfigurationAPI';
import { ServiceAPI } from './types/service/serviceAPI';

@ApiExtraModels(LinkyConfigurationAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('Services (OLD)')
export class ServiceController extends GenericControler {
  constructor(private readonly serviceUsecase: ServiceUsecase) {
    super();
  }

  @Put('utilisateurs/:utilisateurId/services/:serviceId/configuration')
  @ApiOperation({
    summary:
      'Met à jour la configuration du service cible, la payload est un json clés-valeurs, propre à chaque service',
  })
  @ApiBody({
    schema: {
      oneOf: [{ $ref: getSchemaPath(LinkyConfigurationAPI) }],
    },
  })
  @UseGuards(AuthGuard)
  async setServiceConfiguration(
    @Body() body: any,
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceId') serviceId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.serviceUsecase.updateServiceConfiguration(
      utilisateurId,
      serviceId,
      body,
    );
  }

  @Get('utilisateurs/:utilisateurId/services/:serviceDefinitionId')
  @ApiOperation({
    summary: "Consulte un service unique de l'utilisateur",
  })
  @ApiOkResponse({ type: ServiceAPI })
  @UseGuards(AuthGuard)
  async getServiceOfUtilisateur(
    @Param('utilisateurId') utilisateurId: string,
    @Param('serviceDefinitionId') serviceDefinitionId: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    const result = await this.serviceUsecase.getServiceOfUtilisateur(
      utilisateurId,
      serviceDefinitionId,
    );

    if (result === null) {
      ApplicationError.throwServiceNotFound(serviceDefinitionId);
    }

    const mappedResult = ServiceAPI.mapServicesToServicesAPI(
      result,
      this.isCallerAdmin(req),
    );

    return mappedResult;
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
