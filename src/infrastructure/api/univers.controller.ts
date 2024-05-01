import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Put,
  Param,
  Body,
  UseGuards,
  Response,
  Request,
  Get,
  HttpStatus,
  UseFilters,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { UniversAPI } from './types/univers/UniversAPI';
import { UniversUsecase } from '../../../src/usecase/univers.usecase';
import { Univers } from '../../domain/univers/univers';
import { ThematiqueUniversAPI } from './types/univers/ThematiqueUniversAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Univers')
export class UniversController extends GenericControler {
  constructor(private universUsecase: UniversUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/univers')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [UniversAPI],
  })
  @ApiOperation({
    summary: `Retourne les univers auquels peut accéder l'utilisateur`,
  })
  async getUnivers(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getALLOfUser(utilisateurId);
    return result.map((e) => UniversAPI.mapToAPI(e));
  }

  @Get('utilisateurs/:utilisateurId/univers/:universType/thematiques')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    type: [ThematiqueUniversAPI],
  })
  @ApiOperation({
    summary: `Retourne les thematiques de d'un univers particulier d'un utilisateur donné`,
  })
  async getUniversThematiques(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('universType') universType: Univers,
  ): Promise<ThematiqueUniversAPI[]> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.universUsecase.getThematiquesOfUnivers(
      utilisateurId,
      universType,
    );
    return result.map((e) => ThematiqueUniversAPI.mapToAPI(e));
  }
}
