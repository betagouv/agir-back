import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { OubliMdpAPI } from './types/utilisateur/oubliMdpAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { ModifierMdpAPI } from './types/utilisateur/modifierMdpAPI';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { Connexion_v2_Usecase } from '../../usecase/connexion.usecase';
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
    summary: `déconnecte un utilisateur donné`,
  })
  @UseGuards(AuthGuard)
  async disconnec(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.connexion_v2_Usecase.disconnectUser(utilisateurId);
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
