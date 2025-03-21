import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Connexion_v2_Usecase } from '../../usecase/connexion.usecase';
import { ApplicationError } from '../applicationError';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { logoutAPI } from './types/utilisateur/logoutAPI';
import { ModifierMdpAPI } from './types/utilisateur/modifierMdpAPI';
import { OubliMdpAPI } from './types/utilisateur/oubliMdpAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import { Valider2FAAPI } from './types/utilisateur/valider2FAAPI';

export class ConfirmationAPI {
  @ApiProperty({ required: true })
  confirmation: string;
}

@ApiExtraModels(UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('1 - Utilisateur - Connexion')
export class ConnexionController extends GenericControler {
  constructor(private readonly connexion_v2_Usecase: Connexion_v2_Usecase) {
    super();
  }

  @Post('utilisateurs/login_v2')
  @ApiOperation({
    summary:
      "Opération de login V2 d'un utilisateur existant et actif, envoi un code de validation",
  })
  @ApiBody({
    type: LoginUtilisateurAPI,
  })
  @ApiBadRequestResponse({ type: ApplicationError })
  async loginUtilisateur_v2(@Body() body: LoginUtilisateurAPI) {
    await this.connexion_v2_Usecase.loginUtilisateur(
      body.email,
      body.mot_de_passe,
    );
  }

  @Post('utilisateurs/login_v2_code')
  @ApiOperation({
    summary: `Valide le second facteur de login (code reçu par email, renvoie les infos utilisateur ainsi qu'un token JWT si tout est OK`,
  })
  @ApiBody({
    type: Valider2FAAPI,
  })
  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  @ApiBadRequestResponse({ type: ApplicationError })
  async validateCodePourLogin(
    @Body() body: Valider2FAAPI,
  ): Promise<LoggedUtilisateurAPI> {
    const loggedUser = await this.connexion_v2_Usecase.validateCodePourLogin(
      body.email,
      body.code,
    );
    return LoggedUtilisateurAPI.mapToAPI(
      loggedUser.token,
      loggedUser.utilisateur,
    );
  }

  @Post('utilisateurs/:utilisateurId/logout')
  @ApiOperation({
    summary: `Déconnecte un utilisateur donné, si l'utilisateur était FranceConnecté, alors une URL est fournie pour réaliser la redirection France Connect de logout`,
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: logoutAPI })
  async disconnect(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<logoutAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.connexion_v2_Usecase.logout_single_user(
      utilisateurId,
    );
    return {
      france_connect_logout_url: result.fc_logout_url
        ? result.fc_logout_url.toString()
        : undefined,
    };
  }
  @Post('utilisateurs/logout_FC_only/:state')
  @ApiOperation({
    summary: `Déconnecte un utilisateur de France Connect seulement : si l'utilisateur était FranceConnecté, alors une URL est fournie pour réaliser la redirection France Connect de logout`,
  })
  @ApiOkResponse({ type: logoutAPI })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 1000 } })
  async disconnect_FC(@Param('state') state: string): Promise<logoutAPI> {
    const result = await this.connexion_v2_Usecase.logout_FC_only(state);
    return {
      france_connect_logout_url: result.fc_logout_url
        ? result.fc_logout_url.toString()
        : undefined,
    };
  }

  @Post('utilisateurs/oubli_mot_de_passe')
  @ApiOperation({
    summary:
      "Déclenche une procédure d'oubli de mot de passe, envoi un code par mail à l'email, si le mail existe en base",
  })
  @ApiBody({
    type: OubliMdpAPI,
  })
  @ApiOkResponse({ type: RenvoyerCodeAPI })
  @ApiBadRequestResponse({ type: ApplicationError })
  async oubli_mdp(@Body() body: OubliMdpAPI): Promise<RenvoyerCodeAPI> {
    await this.connexion_v2_Usecase.oubli_mot_de_passe(body.email);
    return EmailAPI.mapToAPI(body.email);
  }

  @Post('utilisateurs/modifier_mot_de_passe')
  @ApiOperation({
    summary:
      "Modifie le mod de passe d'un utilisateur en fournissant son email et le code reçu par email",
  })
  @ApiBody({
    type: ModifierMdpAPI,
  })
  @ApiBadRequestResponse({ type: ApplicationError })
  async modifier_mdp(@Body() body: ModifierMdpAPI) {
    await this.connexion_v2_Usecase.modifier_mot_de_passe(
      body.email,
      body.code,
      body.mot_de_passe,
    );
  }
}
