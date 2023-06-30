import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { SuiviUsecase } from '../../usecase/suivi.usecase';
import { using } from 'rxjs';
import { Suivi } from '../../../src/domain/suivi/suivi';

@Controller()
@ApiTags('Suivi')
export class SuiviController {
  constructor(private readonly suiviUsecase: SuiviUsecase) {}
  @Get('utilisateurs/:utilisateurId/suivis')
  async getSuivis(
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<Suivi[]> {
    const suivisCollection = await this.suiviUsecase.listeSuivi(
      utilisateurId,
      type,
    );
    return suivisCollection.mergeAll();
  }

  @Get('utilisateurs/:utilisateurId/suivis/last')
  async getLastSuivi(
    @Param('utilisateurId') utilisateurId: string,
    @Query('type') type?: string,
  ): Promise<Suivi> {
    return await this.suiviUsecase.getLastSuivi(utilisateurId, type);
  }

  @Post('utilisateurs/:utilisateurId/suivis')
  async postSuivi(
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: any,
  ): Promise<any> {
    let suivi = new Suivi(body.type);
    suivi.injectValuesFromObject(body);
    await this.suiviUsecase.createSuivi(suivi, utilisateurId);
    return;
  }
}
