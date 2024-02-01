import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { BibliothequeAPI } from './types/contenu/contenuBiblioAPI';
import { BibliothequeUsecase } from '../../../src/usecase/bibliotheque.usecase';
import { Thematique } from '../../../src/domain/thematique';

@Controller()
@ApiBearerAuth()
@ApiTags('Bibliotheque')
export class BibliothequeController extends GenericControler {
  constructor(private readonly bibliothequeUsecase: BibliothequeUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/bibliotheque')
  @ApiOkResponse({ type: BibliothequeAPI })
  @ApiQuery({
    name: 'filtre_thematiques',
    type: String,
    required: false,
    description: `Une liste de codes de thématiques spérarées par des virgules`,
  })
  @UseGuards(AuthGuard)
  async getBibliotheque(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('filtre_thematiques') filtre_thematiques?: string,
  ): Promise<BibliothequeAPI> {
    this.checkCallerId(req, utilisateurId);

    let thematiques = [];
    if (filtre_thematiques) {
      const thematiques_strings = filtre_thematiques.split(',');
      thematiques = thematiques_strings.map((them) => Thematique[them]);
    }

    const biblio = await this.bibliothequeUsecase.listContenuDejaConsulte(
      utilisateurId,
      thematiques,
    );
    return BibliothequeAPI.mapToAPI(biblio);
  }
}
