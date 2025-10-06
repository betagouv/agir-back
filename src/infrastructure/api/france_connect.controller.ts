import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SourceInscription } from '../../domain/utilisateur/utilisateur';
import { FranceConnectUsecase } from '../../usecase/franceConnect.usecase';
import { GenericControler } from './genericControler';
import {
  CodeStateInputAPI,
  StateInputAPI,
} from './types/utilisateur/codeStateInputAPI';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { logoutAPI } from './types/utilisateur/logoutAPI';

@Controller()
@ApiTags('France Connect')
export class FranceConnectController extends GenericControler {
  constructor(private franceConnectUsecase: FranceConnectUsecase) {
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
  @ApiQuery({
    name: 'source_inscription',
    enum: SourceInscription,
    required: false,
    description: `indique la source de souscription au service (web / mobile / web_ngc (web_ngc qui va basculer vers source tout court))`,
  })
  @ApiQuery({
    name: 'referer',
    required: false,
    description: `un acteur proposant l'inscription, par exemple un partenaire`,
    maxLength: 20,
  })
  @ApiQuery({
    required: false,
    name: 'referer_keyword',
    description: `un texte arbitraire qui peut être fourni à l'inscription en complément de 'referer', pour tagguer par exemple un sous groupe d'utilisateurs`,
    maxLength: 50,
  })
  async login(
    @Query('situation_ngc_id') situation_ngc_id: string,
    @Query('source_inscription') source_inscription: string,
    @Query('referer') referer: string,
    @Query('referer_keyword') referer_keyword: string,
  ) {
    const source_i =
      SourceInscription[source_inscription] || SourceInscription.inconnue;

    const redirect_url =
      await this.franceConnectUsecase.genererConnexionFranceConnect(
        source_i,
        situation_ngc_id,
        referer,
        referer_keyword,
      );
    return { url: redirect_url };
  }

  @ApiOperation({
    summary:
      'Finalise la connexion via france connect en échangeant un [code / state] pour un token applicatif',
  })
  @Post('login_france_connect_step_2')
  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  @ApiBody({
    type: CodeStateInputAPI,
  })
  async login_callback(
    @Body() body: CodeStateInputAPI,
  ): Promise<LoggedUtilisateurAPI> {
    const user_data = await this.franceConnectUsecase.connecterOuInscrire(
      body.oidc_state,
      body.oidc_code,
    );

    return LoggedUtilisateurAPI.mapToAPI(
      user_data.token,
      user_data.utilisateur,
    );
  }

  @Post('logout')
  @ApiOperation({
    summary: `Déconnecte un utilisateur de France Connect seulement : si l'utilisateur était FranceConnecté, alors une URL est fournie pour réaliser la redirection France Connect de logout`,
  })
  @ApiBody({
    type: StateInputAPI,
  })
  @ApiOkResponse({ type: logoutAPI })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  async disconnect_FC(@Body() body: StateInputAPI): Promise<logoutAPI> {
    const result = await this.franceConnectUsecase.logout_FC_only(
      body.oidc_state,
    );
    return {
      france_connect_logout_url: result.fc_logout_url
        ? result.fc_logout_url.toString()
        : undefined,
    };
  }
}
