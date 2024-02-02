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
import {
  BibliothequeAPI,
  ContenuBibliothequeAPI,
} from './types/contenu/contenuBiblioAPI';
import { BibliothequeUsecase } from '../../../src/usecase/bibliotheque.usecase';
import { Thematique } from '../../../src/domain/thematique';
import { ContentType } from '../../../src/domain/contenu/contentType';

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
  @ApiQuery({
    name: 'type',
    enum: ContentType,
    required: false,
    description: `le type de contenu recherché : article, quizz, etc`,
  })
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id de contenu pour récupérer un contenu spécifique, si présent, les bloc de filtre n'est pas présent dans la réponse`,
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

    const biblio = await this.bibliothequeUsecase.rechercheBiblio(
      utilisateurId,
      thematiques,
      titre,
      favoris ? favoris : false,
    );
    return BibliothequeAPI.mapToAPI(biblio);
  }

  @Get('utilisateurs/:utilisateurId/bibliotheque/articles/:content_id')
  @ApiOkResponse({ type: ContenuBibliothequeAPI })
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id d'un article`,
  })
  @UseGuards(AuthGuard)
  async getArticleBiblio(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('content_id') content_id: string,
  ): Promise<ContenuBibliothequeAPI> {
    this.checkCallerId(req, utilisateurId);

    const article = await this.bibliothequeUsecase.geArticle(
      utilisateurId,
      content_id,
    );
    return ContenuBibliothequeAPI.mapArticleToAPI(article);
  }
}
