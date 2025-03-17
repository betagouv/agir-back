import { Controller, Get, Param, Response, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response as Res } from 'express';
import { TypeAction } from '../../domain/actions/typeAction';
import { AideDefinition } from '../../domain/aides/aideDefinition';
import { PartenaireDefinition } from '../../domain/contenu/partenaireDefinition';
import { CmsPreviewUsecase } from '../../usecase/cmsPreview.usecase';
import { PartenaireRepository } from '../repository/partenaire.repository';
import { GenericControler } from './genericControler';
import { PreviewActionAPI } from './types/previews/PreviewActionAPI';
import { PreviewAideAPI } from './types/previews/PreviewAideAPI';
import { PreviewArticleAPI } from './types/previews/PreviewArticleAPI';

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
    type: PreviewActionAPI,
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
  ): Promise<PreviewActionAPI> {
    let type = this.castTypeActionOrException(type_action);
    const result = await this.cmsPreviewUsecase.getActionPreview(
      content_id,
      type,
    );
    return PreviewActionAPI.mapToAPI(result);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @ApiOkResponse({ type: PreviewAideAPI })
  @Get('cms_preview/aides/:content_id')
  async getAideUnique(
    @Param('content_id') content_id: string,
  ): Promise<PreviewAideAPI> {
    const aide = await this.cmsPreviewUsecase.getAidePreviewByIdCMS(content_id);
    return PreviewAideAPI.mapToAPI(aide);
  }
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @ApiOkResponse({ type: PreviewAideAPI })
  @Get('cms_preview/aides/:content_id/html')
  async getAideUniqueHTML(
    @Param('content_id') content_id: string,
    @Response() res: Res,
  ) {
    const aide = await this.cmsPreviewUsecase.getAidePreviewByIdCMS(content_id);

    let result = this.aideHTML(aide);

    return res.send(`${result.join('<br/>')}`);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 1, ttl: 1000 } })
  @Get('cms_preview/articles/:content_id')
  @ApiOkResponse({ type: PreviewArticleAPI })
  @ApiOperation({
    summary: `Consultation d'un article sans connexion`,
  })
  async getArticleNonConnecte(
    @Param('content_id') content_id: string,
  ): Promise<PreviewArticleAPI> {
    const article = await this.cmsPreviewUsecase.getArticlePreviewByIdCMS(
      content_id,
    );
    return PreviewArticleAPI.mapToAPI(article);
  }

  private aideHTML(content: { data: object; aide: AideDefinition }): string[] {
    const aide = content.aide;
    const result = [];

    result.push(
      `-------------------------------------------------------------------------------------------------------------------------------------`,
    );
    result.push(`Thematiques : ${aide.thematiques}`);
    result.push(`Est gratuit : ${aide.est_gratuit ? 'OUI' : 'NON'}`);
    result.push(
      `Montant max : ${
        aide.montant_max ? aide.montant_max + ' €' : 'non renseigné'
      }`,
    );
    result.push(
      `Dernière date de mise à jour : ${aide.derniere_maj?.toLocaleDateString(
        'fr-FR',
      )}`,
    );
    let partenaire: PartenaireDefinition;
    if (aide.partenaire_id) {
      partenaire = PartenaireRepository.getPartenaire(aide.partenaire_id);
      result.push(`Partenaire nom : ${partenaire.nom}`);
      if (partenaire.url) {
        result.push(
          `Partenaire lien <a href="${partenaire.url}">${partenaire.url}</a>`,
        );
      } else {
        result.push(`Partenaire URL manquante 🔥🔥🔥`);
      }
      if (partenaire.image_url) {
        result.push(`Partenaire image :</br>`);
        result.push(
          `<img src= "${partenaire.image_url}" width="200" style="border: 5px solid #555"></br>`,
        );
      } else {
        result.push(`Partenaire image manquante 🔥🔥🔥`);
      }
    } else {
      result.push(`Info partenaire manquantes 🔥🔥🔥`);
    }
    if (aide.besoin) {
      result.push(`Besoin associé: ${aide.besoin_desc}`);
    } else {
      result.push(`Besoin manquant 🔥🔥🔥`);
    }
    if (aide.url_source) {
      result.push(
        `URL de l'information source : <a href="${aide.url_source}">${aide.url_source}</a>`,
      );
    } else {
      result.push(`URL de l'information source manquante 🔥🔥🔥`);
    }

    if (aide.url_demande) {
      result.push(
        `URL du formulaire de demande : <a href="${aide.url_demande}">${aide.url_demande}</a>`,
      );
    } else {
      result.push(`URL du formulaire de demande manquante 🔥🔥🔥`);
    }

    result.push(
      `-------------------------------------------------------------------------------------------------------------------------------------`,
    );
    result.push(`<h1>${aide.titre}</h1>`);
    result.push(`${aide.contenu}`);
    result.push(
      `-------------------------------------------------------------------------------------------------------------------------------------`,
    );

    return result;
  }
}
