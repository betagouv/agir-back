import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FranceConnectUsecase } from '../../usecase/franceConnect.usecase';
import { AuthGuard } from '../auth/guard';
import { OidcService } from '../auth/oidc.service';
import { OIDCStateRepository } from '../repository/oidcState.repository';
import { GenericControler } from './genericControler';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';

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
  @ApiQuery({
    name: 'situation_ngc_id',
    type: String,
    required: false,
    description: `id d'une situation NGC en attente de liaison avec le futur compte utilisateur`,
  })
  async login(@Query('situation_ngc_id') situation_ngc_id: string) {
    const redirect_url =
      await this.franceConnectUsecase.genererConnexionFranceConnect(
        situation_ngc_id,
      );
    return { url: redirect_url };
  }

  @ApiOperation({
    summary:
      'finalise la connexion via france connect en échangeant un [code / state] pour un token applicatif',
  })
  @ApiQuery({
    name: 'oidc_code',
    type: String,
    required: true,
    description: `code OIDC pour finalisation connexion/inscription`,
  })
  @ApiQuery({
    name: 'oidc_state',
    type: String,
    required: true,
    description: `token technique pour protéger le flux de connexion`,
  })
  @Post('login_france_connect_step_2')
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
