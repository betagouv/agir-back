import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WinterUsecase } from '../../usecase/winter.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { ConnectPRMByAddressAPI } from './types/winter/connectPRMByAddressAPI';
import { ConnectPRMByPRMAPI } from './types/winter/ConnectPRMByPRMAPI';
import { WinterConsommationAPI } from './types/winter/winterConsommationAPI';

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
      body,
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

  @ApiOperation({
    summary: 'Supprime un souscription de PRM',
  })
  @Delete('utilisateurs/:utilisateurId/winter')
  @UseGuards(AuthGuard)
  async supprimer_RPM(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);

    await this.winterUsecase.supprimerPRM(utilisateurId);
  }

  @ApiOperation({
    summary: `Donne la décomposition de la consommation annuelle`,
  })
  @ApiOkResponse({
    type: WinterConsommationAPI,
  })
  @Get('utilisateurs/:utilisateurId/winter/consommation')
  @UseGuards(AuthGuard)
  async getConsommation(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<WinterConsommationAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.winterUsecase.getUsage(utilisateurId);
    return WinterConsommationAPI.mapToAPI(result);
  }
}
