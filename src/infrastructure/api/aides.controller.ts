import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Thematique } from '../../domain/thematique/thematique';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { AideAPI } from './types/aide/AideAPI';
import { CatalogueAideAPI } from './types/aide/CatalogueAideAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Aides')
export class AidesController extends GenericControler {
  constructor(private readonly aidesUsecase: AidesUsecase) {
    super();
  }

  @Post('utilisateurs/:utilisateurId/aides/:aideId/vu_infos')
  @ApiOperation({
    summary: `Indique que l'utilisateur est allé voir la page source de présentation de l'aide`,
  })
  @UseGuards(AuthGuard)
  async vuInfo(
    @Param('utilisateurId') utilisateurId: string,
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.aidesUsecase.consulterAideInfosLink(utilisateurId, aideId);
  }

  @Post('utilisateurs/:utilisateurId/aides/:aideId/consulter')
  @ApiOperation({
    summary: `Indique que l'utilisateur a consulté cette aide particulière`,
  })
  @UseGuards(AuthGuard)
  async consulterAide(
    @Param('utilisateurId') utilisateurId: string,
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.aidesUsecase.consulterAide(utilisateurId, aideId);
  }

  @Post('utilisateurs/:utilisateurId/aides/:aideId/vu_demande')
  @ApiOperation({
    summary: `Indique que l'utilisateur est allé voir la page source de demande de l'aide`,
  })
  @UseGuards(AuthGuard)
  async vuDemande(
    @Param('utilisateurId') utilisateurId: string,
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<void> {
    this.checkCallerId(req, utilisateurId);
    await this.aidesUsecase.consulterAideDemandeLink(utilisateurId, aideId);
  }

  @ApiOkResponse({ type: CatalogueAideAPI })
  @ApiQuery({
    name: 'thematique',
    enum: Thematique,
    enumName: 'thematique',
    isArray: true,
    required: false,
    description: `filtrage par thematiques, plusieurs thematiques possible avec la notation ?thematique=XXX&thematique=YYY`,
  })
  @Get('utilisateurs/:utilisateurId/aides_v2')
  @UseGuards(AuthGuard)
  async getCatalogueAides_v2(
    @Param('utilisateurId') utilisateurId: string,
    @Query('thematique') thematique: string[] | string,
    @Request() req,
  ): Promise<CatalogueAideAPI> {
    this.checkCallerId(req, utilisateurId);
    const liste_thematiques_input =
      this.getStringListFromStringArrayAPIInput(thematique);

    const liste_thematiques: Thematique[] = [];

    for (const them_string of liste_thematiques_input) {
      liste_thematiques.push(this.castThematiqueOrException(them_string));
    }
    const aides = await this.aidesUsecase.getCatalogueAidesUtilisateur(
      utilisateurId,
      liste_thematiques,
    );
    return CatalogueAideAPI.mapToAPI(aides.aides, aides.utilisateur);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  @ApiOkResponse({ type: AideAPI })
  @Get('aides/:aideId')
  async getAideUnique(
    @Param('aideId') aideId: string,
    @Request() req,
  ): Promise<AideAPI> {
    const aide = await this.aidesUsecase.getAideUniqueByIdCMS(aideId);
    return AideAPI.mapToAPI(aide);
  }

  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: AideAPI })
  @Get('utilisateurs/:utilisateurId/aides/:aideId')
  async getAideUtilisateur(
    @Param('aideId') aideId: string,
    @Param('utilisateurId') utilisateurId: string,
    @Request() req,
  ): Promise<AideAPI> {
    this.checkCallerId(req, utilisateurId);
    const aide = await this.aidesUsecase.getAideUniqueUtilisateurByIdCMS(
      utilisateurId,
      aideId,
    );
    return AideAPI.mapToAPI(aide);
  }
}
