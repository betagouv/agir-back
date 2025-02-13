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
import { ProfileUsecase } from '../../usecase/profile.usecase';
import {
  SourceInscription,
  Utilisateur,
  UtilisateurStatus,
} from '../../domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { OIDCStateRepository } from '../repository/oidcState.repository';
import { ApplicationError } from '../applicationError';

export type FCUserInfo = {
  sub: string;
  email: string;
  given_name: string;
  given_name_array: string[];
  aud: string;
  exp: number;
  iat: number;
  iss: string;
};

@Controller()
@ApiTags('France Connect')
export class AuthController extends GenericControler {
  constructor(
    private userRepository: UtilisateurRepository,
    private oIDCStateRepository: OIDCStateRepository,
    private profileUsecase: ProfileUsecase,
    private oidcService: OidcService,
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
      await this.oidcService.generatedAuthRedirectUrlAndSaveState();
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

    const state = await this.oIDCStateRepository.getByState(oidc_state);
    if (!state) {
      ApplicationError.throwBadOIDCCodeState();
    }

    console.log(state);

    // TOKEN ENDPOINT
    const access_token = await this.oidcService.getAccessToken(
      oidc_state,
      oidc_code,
    );

    console.log(`access token : [${access_token}]`);

    // INFO ENDPOINT
    const user_data_base64: string =
      await this.oidcService.getUserDataByAccessToken(access_token);
    console.log('THIS IS USER DATA');
    console.log(user_data_base64);
    const blocks = user_data_base64.split('.');
    const charge_utile = blocks[1];
    const json_user_data = Buffer.from(charge_utile, 'base64').toString(
      'ascii',
    );
    console.log(json_user_data);
    const user_info: FCUserInfo = JSON.parse(json_user_data);
    console.log(user_info);

    // FINDING USER
    let utilisateur = await this.profileUsecase.findUtilisateurByEmail(
      user_info.email,
    );
    if (!utilisateur) {
      utilisateur = Utilisateur.createNewUtilisateur(
        user_info.email,
        false,
        SourceInscription.france_connect,
      );

      utilisateur.prenom = user_info.given_name;
      utilisateur.status = UtilisateurStatus.default;
      utilisateur.active_account = true;
      utilisateur.est_valide_pour_classement = true;

      await this.userRepository.createUtilisateur(utilisateur);
    }

    await this.oidcService.injectUtilisateurIdToState(
      oidc_state,
      utilisateur.id,
    );

    // CREATING INNER APP TOKEN
    const token = await this.oidcService.createNewInnerAppToken(utilisateur.id);

    return LoggedUtilisateurAPI.mapToAPI(token, utilisateur);
  }

  @Get('logout_france_connect/:utilisateurId')
  @ApiOperation({
    summary:
      'Initie une redirection vers France Connect pour processus de dé-connexion',
  })
  @UseGuards(AuthGuard)
  @Redirect()
  async logout(@Param('utilisateurId') utilisateurId: string, @Request() req) {
    this.checkCallerId(req, utilisateurId);
    const redirect_url =
      await this.oidcService.generatedLogoutUrlAndDeleteState(utilisateurId);
    return { url: redirect_url };
  }
}
