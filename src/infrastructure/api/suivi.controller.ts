import {
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  refs,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import { Suivi } from '../../domain/suivi/suivi';
import { SuiviAlimentation } from '../../domain/suivi/suiviAlimentation';
import { SuiviTransport } from '../../domain/suivi/suiviTransport';
import { SuiviType } from '../../domain/suivi/suiviType';
import { SuiviAlimentationAPI, SuiviTransportAPI } from './types/suiviAPI';

@ApiExtraModels(SuiviAlimentationAPI, SuiviTransportAPI)
@Controller()
@ApiTags('Suivi')
export class SuiviController {
  constructor(private readonly suiviUsecase: SuiviUsecase) {}
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
  @Get('utilisateurs/:utilisateurId/suivis')
  async getSuivis(
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<(SuiviAlimentationAPI | SuiviTransportAPI)[]> {
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
  @Get('utilisateurs/:utilisateurId/suivis/last')
  async getLastSuivi(
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<Suivi> {
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
  @Post('utilisateurs/:utilisateurId/suivis')
  async postSuivi(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: any,
  ): Promise<Suivi> {
    let suivi;
    switch (body.type) {
      case SuiviType.alimentation:
        suivi = new SuiviAlimentation();
        break;
      case SuiviType.transport:
        suivi = new SuiviTransport();
        break;
      default:
        throw new BadRequestException(`Suivi de type ${body.type} inconnu`);
    }
    suivi.injectValuesFromObject(body);
    const result = await this.suiviUsecase.createSuivi(suivi, utilisateurId);
    return result;
  }
}
