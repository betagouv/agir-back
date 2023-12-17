import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import { Suivi } from '../../domain/suivi/suivi';
import { SuiviAlimentation } from '../../domain/suivi/suiviAlimentation';
import { SuiviTransport } from '../../domain/suivi/suiviTransport';
import { SuiviType } from '../../domain/suivi/suiviType';
import {
  SuiviAlimentationAPI,
  SuiviTransportAPI,
} from './types/suivi/suiviAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { ApplicationError } from '../applicationError';

@ApiExtraModels(SuiviAlimentationAPI, SuiviTransportAPI)
@Controller()
@ApiTags('Suivi')
@ApiBearerAuth()
export class SuiviController extends GenericControler {
  constructor(private readonly suiviUsecase: SuiviUsecase) {
    super();
  }
  @ApiOkResponse({
    schema: {
      items: {
        anyOf: [
          { $ref: getSchemaPath(SuiviAlimentationAPI) },
          { $ref: getSchemaPath(SuiviTransportAPI) },
        ],
      },
    },
  })
  @ApiOperation({
    summary:
      "Liste l'ensemble des suivi alimentation-transport réalisés depuis le début de l'utilisation du service",
  })
  @Get('utilisateurs/:utilisateurId/suivis')
  @UseGuards(AuthGuard)
  async getSuivis(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<(SuiviAlimentationAPI | SuiviTransportAPI)[]> {
    this.checkCallerId(req, utilisateurId);
    const suivisCollection = await this.suiviUsecase.listeSuivi(
      utilisateurId,
      SuiviType[type],
    );
    return suivisCollection.mergeAll() as any;
  }

  @ApiOkResponse({
    schema: {
      anyOf: [
        { $ref: getSchemaPath(SuiviAlimentationAPI) },
        { $ref: getSchemaPath(SuiviTransportAPI) },
      ],
    },
  })
  @ApiOperation({
    summary:
      "Le dernier suivi alimentation-transport réalisé par l'utilisateur",
  })
  @Get('utilisateurs/:utilisateurId/suivis/last')
  @UseGuards(AuthGuard)
  async getLastSuivi(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<Suivi> {
    this.checkCallerId(req, utilisateurId);

    const lastSuivi = await this.suiviUsecase.getLastSuivi(
      utilisateurId,
      SuiviType[type],
    );
    if (lastSuivi === null) {
      throw new NotFoundException(
        `Aucun suivi de type ${type ? type : 'any'} trouvé en base`,
      );
    }
    return lastSuivi;
  }

  @ApiBody({
    schema: {
      anyOf: [
        { $ref: getSchemaPath(SuiviAlimentationAPI) },
        { $ref: getSchemaPath(SuiviTransportAPI) },
      ],
    },
    examples: {
      SuiviAlimentationAPI: { value: SuiviAlimentationAPI.example() },
      SuiviTransportAPI: {
        value: SuiviTransportAPI.example(),
      },
    },
  })
  @ApiOperation({
    summary: "Création d'un nouveau suivi, de type alimentation ou transport",
  })
  @Post('utilisateurs/:utilisateurId/suivis')
  @UseGuards(AuthGuard)
  async postSuivi(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: any,
  ): Promise<Suivi> {
    this.checkCallerId(req, utilisateurId);

    let suivi;
    switch (body.type) {
      case SuiviType.alimentation:
        suivi = new SuiviAlimentation();
        break;
      case SuiviType.transport:
        suivi = new SuiviTransport();
        break;
      default:
        ApplicationError.throwSuiviInconnuError(body.type);
    }
    suivi.injectValuesFromObject(body);
    const result = await this.suiviUsecase.createSuivi(suivi, utilisateurId);
    return result;
  }
}
