import {
  Controller,
  Get,
  Param,
  Query,
  Redirect,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OidcService } from '../auth/oidc.service';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { OIDCStateRepository } from '../repository/oidcState.repository';
import { FranceConnectUsecase } from '../../usecase/franceConnect.usecase';

@Controller()
@ApiTags('France Connect')
export class FranceConnectController extends GenericControler {
  constructor(
    private oIDCStateRepository: OIDCStateRepository,
    private oidcService: OidcService,
    private franceConnectUsecase: FranceConnectUsecase,
  ) {
    super();
  }

  @Get('login_france_connect')
  @Redirect()
  @ApiOperation({
    summary:
      'Initie une redirection vers France Connect pour processus de connexion',
  })
  async login() {
    const redirect_url =
      await this.franceConnectUsecase.genererConnexionFranceConnect();
    return { url: redirect_url };
  }

  @ApiOperation({
    summary:
      'finalise la connexion via france connect en échangeant un [code / state] pour un token applicatif',
  })
  @Get('login_france_connect_step_2')
  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  async login_callback(
    @Query('oidc_code') oidc_code: string,
    @Query('oidc_state') oidc_state: string,
  ): Promise<LoggedUtilisateurAPI> {
    console.log(`oidc_code : [${oidc_code}]`);
    console.log(`oidc_state : [${oidc_state}]`);

    const user_data = await this.franceConnectUsecase.connecterOuInscrire(
      oidc_state,
      oidc_code,
    );

    return LoggedUtilisateurAPI.mapToAPI(
      user_data.token,
      user_data.utilisateur,
    );
  }

  @Get('logout_france_connect/:utilisateurId')
  @ApiOperation({
    summary:
      'Initie une redirection vers France Connect pour processus de dé-connexion (route temporaire de test)',
  })
  @UseGuards(AuthGuard)
  @Redirect()
  async logout(@Param('utilisateurId') utilisateurId: string, @Request() req) {
    this.checkCallerId(req, utilisateurId);

    const state = await this.oIDCStateRepository.getByUtilisateurId(
      utilisateurId,
    );
    const redirect_url = await this.oidcService.generateLogoutUrl(
      state.idtoken,
    );
    return { url: redirect_url };
  }
}
