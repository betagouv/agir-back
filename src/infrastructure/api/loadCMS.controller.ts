import { Controller, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { CMSImportUsecase } from '../../usecase/cms.import.usecase';

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

  @Post('/admin/load_thematiques_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les thematiques publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSThematiques(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadThematiquesFromCMS();
  }

  @Post('/admin/load_missions_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les missions publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSMissions(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadMissionsFromCMS();
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
  @Post('/admin/load_defi_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les défis publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSDefis(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadDefisFromCMS();
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
