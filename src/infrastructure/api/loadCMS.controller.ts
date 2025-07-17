import { Controller, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CMSImportUsecase } from '../../usecase/cms.import.usecase';
import { GenericControler } from './genericControler';

@Controller()
@ApiTags('Z - Load CMS')
@ApiBearerAuth()
export class LoadCMSController extends GenericControler {
  constructor(private cmsUsecase: CMSImportUsecase) {
    super();
  }

  @Post('/admin/load_articles_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les articles publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSArticles(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadArticlesFromCMS();
  }

  @Post('/admin/load_tags_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les tags v2 publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMStags(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadTagsV2FromCMS();
  }

  @Post('/admin/load_selections_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les selections publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSSelection(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadSelectionsFromCMS();
  }

  @Post('/admin/load_actions_bilan_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les actions de type bilan publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSActionsBilan(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadActionsBilanFromCMS();
  }

  @Post('/admin/load_actions_quizzes_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les actions de type quizz publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSActionsQuizzes(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadActionsQuizzesFromCMS();
  }

  @Post('/admin/load_actions_classique_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les actions de type classique publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSActionsClassique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadActionsClassiquesFromCMS();
  }

  @Post('/admin/load_actions_simulateur_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les actions de type simulateur publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSActionsSimulateur(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadActionsSimulateursFromCMS();
  }

  @Post('/admin/load_thematiques_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les thematiques publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSThematiques(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadThematiquesFromCMS();
  }
  @Post('/admin/load_conformite_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les pages de conformités publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSConformites(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadConformiteFromCMS();
  }

  @Post('/admin/load_kycs_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les KYCs publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllKYCMissions(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadKYCFromCMS();
  }

  @Post('/admin/load_partenaires_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les partenaires publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async load_partenaires_from_cms(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadPartenairesFromCMS();
  }

  @Post('/admin/load_faq_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les faq publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async load_faq_from_cms(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadFAQFromCMS();
  }

  @Post('/admin/load_blocktexte_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les block de textes publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async load_blocktexte_from_cms(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadBlockTexteFromCMS();
  }

  @Post('/admin/load_quizzes_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les quizz publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSquizzes(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadQuizzFromCMS();
  }

  @Post('/admin/load_aides_from_cms')
  @ApiOperation({
    summary: 'Upsert toures les aides publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSaides(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadAidesFromCMS();
  }
}
