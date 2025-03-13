import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { TypeAction } from '../../domain/actions/typeAction';
import { CmsPreviewUsecase } from '../../usecase/cmsPreview.usecase';
import { GenericControler } from './genericControler';
import { ActionAPI } from './types/actions/ActionAPI';
import { AideAPI } from './types/aide/AideAPI';
import { ArticleBibliothequeAPI } from './types/contenu/articleAPI';

@ApiTags('CMS Previews')
@Controller()
export class CmsPreviewController extends GenericControler {
  constructor(private cmsPreviewUsecase: CmsPreviewUsecase) {
    super();
  }

  @Get('cms_preview/actions/:type_action/:content_id')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @ApiOkResponse({
    type: ActionAPI,
  })
  @ApiOperation({
    summary: `Retourne la preview CMS d'une action (elle peut encore être en DRAFT côté CMS)`,
  })
  @ApiParam({
    name: 'type_action',
    enum: TypeAction,
    description: `type de l'action (classique/bilan/quizz/etc)`,
  })
  @ApiParam({
    name: 'content_id',
    type: String,
    description: `id CMS de l'action`,
  })
  async getActionPreview(
    @Param('content_id') content_id: string,
    @Param('type_action') type_action: string,
  ): Promise<ActionAPI> {
    let type = this.castTypeActionOrException(type_action);
    const result = await this.cmsPreviewUsecase.getActionPreview(
      content_id,
      type,
    );
    return ActionAPI.mapToAPI(result);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @ApiOkResponse({ type: AideAPI })
  @Get('cms_preview/aides/:content_id')
  async getAideUnique(
    @Param('content_id') content_id: string,
  ): Promise<AideAPI> {
    const aide = await this.cmsPreviewUsecase.getAidePreviewByIdCMS(content_id);
    return AideAPI.mapToAPI(aide);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @Get('bibliotheque/articles/:content_id')
  @ApiOkResponse({ type: ArticleBibliothequeAPI })
  @ApiOperation({
    summary: `Consultation d'un article sans connexion`,
  })
  async getArticleNonConnecte(
    @Param('content_id') content_id: string,
  ): Promise<ArticleBibliothequeAPI> {
    const article = await this.cmsPreviewUsecase.getArticlePreviewByIdCMS(
      content_id,
    );
    return ArticleBibliothequeAPI.mapArticleToAPI(article);
  }
}
