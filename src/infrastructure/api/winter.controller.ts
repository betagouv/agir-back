import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WinterUsecase } from '../../usecase/winter.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ConnectPRMByAddressAPI } from './types/winter/connectPRMByAddressAPI';
import { ConnectPRMByPRMAPI } from './types/winter/ConnectPRMByPRMAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Winter')
export class WinterController extends GenericControler {
  constructor(private winterUsecase: WinterUsecase) {
    super();
  }

  @ApiOperation({
    summary: 'Tente une inscription par adresse au service winter',
  })
  @Post('utilisateurs/:utilisateurId/winter/inscription_par_adresse')
  @ApiBody({
    type: ConnectPRMByAddressAPI,
  })
  @UseGuards(AuthGuard)
  async connecte_par_adresse(
    @Request() req,
    @Body() body: ConnectPRMByAddressAPI,
    @Param('utilisateurId') utilisateurId: string,
    @Headers('user-agent') user_agent: string,
    @Headers('X-Forwarded-For') x_forwarded_for: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.winterUsecase.inscrireAdresse(
      utilisateurId,
      body.nom,
      body.adresse,
      body.code_postal,
      body.code_commune,
      x_forwarded_for,
      user_agent,
    );
  }

  @ApiOperation({
    summary: 'Tente une inscription par PRM au service winter',
  })
  @Post('utilisateurs/:utilisateurId/winter/inscription_par_prm')
  @ApiBody({
    type: ConnectPRMByPRMAPI,
  })
  @UseGuards(AuthGuard)
  async connecte_par_RPM(
    @Request() req,
    @Body() body: ConnectPRMByPRMAPI,
    @Param('utilisateurId') utilisateurId: string,
    @Headers('user-agent') user_agent: string,
    @Headers('X-Forwarded-For') x_forwarded_for: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.winterUsecase.inscrirePRM(
      utilisateurId,
      body.nom,
      body.prm,
      x_forwarded_for,
      user_agent,
    );
  }
}
