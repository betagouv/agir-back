import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { BibliothequeAPI } from './types/contenu/contenuBiblioAPI';
import { BibliothequeUsecase } from '../../../src/usecase/bibliotheque.usecase';
import { Thematique } from '../../domain/contenu/thematique';
import { ContentType } from '../../../src/domain/contenu/contentType';
import { ArticleBibliothequeAPI } from './types/contenu/articleAPI';
import { QuizzBibliothequeAPI } from './types/contenu/quizzAPI';
import { QuizzAttemptAPI } from './types/contenu/quizzAttemptAPI';

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
  @ApiOkResponse({ type: ArticleBibliothequeAPI })
  @ApiOperation({
    summary: `Consultation d'un article, une fois récupéré il est considéré comme lu pour l'utilisateur`,
  })
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
  ): Promise<ArticleBibliothequeAPI> {
    this.checkCallerId(req, utilisateurId);

    const article = await this.bibliothequeUsecase.getArticle(
      utilisateurId,
      content_id,
    );
    return ArticleBibliothequeAPI.mapArticleToAPI(article);
  }

  @Get('bibliotheque/articles/:content_id')
  @ApiOkResponse({ type: ArticleBibliothequeAPI })
  @ApiOperation({
    summary: `Consultation d'un article sans connexion`,
  })
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id d'un article`,
  })
  async getArticleNonConnecte(
    @Param('content_id') content_id: string,
  ): Promise<ArticleBibliothequeAPI> {
    const article = await this.bibliothequeUsecase.getArticleAnonymous(
      content_id,
    );
    return ArticleBibliothequeAPI.mapArticleToAPI(article);
  }

  @Get('bibliotheque/quizz/:content_id')
  @ApiOkResponse({ type: QuizzBibliothequeAPI })
  @ApiOperation({
    summary: `Consultation d'un quizz sans connexion`,
  })
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id d'un quizz`,
  })
  async getQuizzeNonConnecte(
    @Param('content_id') content_id: string,
  ): Promise<QuizzBibliothequeAPI> {
    const quizz = await this.bibliothequeUsecase.getQuizzAnonymous(content_id);
    return QuizzBibliothequeAPI.map(quizz);
  }

  @Get('utilisateurs/:utilisateurId/bibliotheque/quizz/:content_id')
  @ApiOkResponse({ type: QuizzBibliothequeAPI })
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id d'un quizz`,
  })
  @UseGuards(AuthGuard)
  async getQuizz(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('content_id') content_id: string,
  ): Promise<QuizzBibliothequeAPI> {
    this.checkCallerId(req, utilisateurId);

    const quizz = await this.bibliothequeUsecase.getQuizz(
      utilisateurId,
      content_id,
    );
    return QuizzBibliothequeAPI.map(quizz);
  }
  @Patch('utilisateurs/:utilisateurId/bibliotheque/quizz/:content_id')
  @ApiQuery({
    name: 'content_id',
    type: String,
    required: false,
    description: `l'id d'un quizz`,
  })
  @ApiOperation({
    summary: `positionne un score de réponse sur le quizz, l'article associé est considéré comme lu`,
  })
  @ApiBody({
    type: QuizzAttemptAPI,
  })
  @UseGuards(AuthGuard)
  async addAttemptQuizz(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('content_id') content_id: string,
    @Body() body: QuizzAttemptAPI,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.bibliothequeUsecase.addQuizzAttempt(
      utilisateurId,
      content_id,
      body.pourcent,
    );
  }
}
