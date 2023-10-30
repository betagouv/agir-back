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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { ServiceDefinitionAPI } from './types/service/serviceDefinitionAPI';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { AddServiceAPI } from './types/service/addServiceAPI';
import { ErrorService } from '../errorService';

@ApiExtraModels(ServiceDefinitionAPI)
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
  @ApiOkResponse({ type: [ServiceDefinitionAPI] })
  @UseGuards(AuthGuard)
  async listeServicesDef(): Promise<ServiceDefinitionAPI[]> {
    const result = await this.serviceUsecase.listServicesDefinitions();
    return result.map((def) => {
      return {
        id: def.id,
        local: def.local,
        titre: def.titre,
        url: def.url,
        is_url_externe: def.is_url_externe,
      };
    });
  }
  @Post('utilisateurs/:id/services')
  @ApiOperation({
    summary: "Ajoute un service provenant du catalogue à l'utilisateur donné",
  })
  @ApiBody({
    type: AddServiceAPI,
  })
  @UseGuards(AuthGuard)
  async addServiceToUtilisateur(
    @Body() body: AddServiceAPI,
    @Param('id') utilisateurId: string,
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
  @Delete('utilisateurs/:id/services/:id_service')
  @ApiOperation({
    summary: "Supprime un service d'id donné associé à l'utilisateur",
  })
  @UseGuards(AuthGuard)
  async deleteServiceFromUtilisateur(
    @Param('id') utilisateurId: string,
    @Param('id_service') id_service: string,
    @Request() req,
  ) {
    this.checkCallerId(req, utilisateurId);

    return await this.serviceUsecase.removeServiceFromUtilisateur(id_service);
  }
}
