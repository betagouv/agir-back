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
  @ApiQuery({
    name: 'titre',
    type: String,
    required: false,
    description: `une fragment du titre, insensible à la casse`,
  })
  @ApiQuery({
    name: 'favoris',
    type: Boolean,
    required: false,
    description: `si à 'true' ne ramène que le contenu en favoris utilisateur`,
  })
  @UseGuards(AuthGuard)
  async getBibliotheque(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Query('filtre_thematiques') filtre_thematiques?: string,
    @Query('titre') titre?: string,
    @Query('favoris') favoris?: boolean,
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
      titre,
      favoris ? favoris : false,
    );
    return BibliothequeAPI.mapToAPI(biblio);
  }
}
