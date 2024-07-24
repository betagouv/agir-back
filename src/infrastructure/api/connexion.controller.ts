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
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { OubliMdpAPI } from './types/utilisateur/oubliMdpAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { ModifierMdpAPI } from './types/utilisateur/modifierMdpAPI';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { Connexion_v1_Usecase } from '../../usecase/connexion_v1.usecase';

export class ConfirmationAPI {
  @ApiProperty({ required: true })
  confirmation: string;
}

@ApiExtraModels(CreateUtilisateurAPI, UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('1 - Utilisateur - Connexion')
export class ConnexionController extends GenericControler {
  constructor(private readonly connexion_v1_Usecase: Connexion_v1_Usecase) {
    super();
  }

  @Post('utilisateurs/login')
  @ApiOperation({
    summary:
      "Opération de login d'un utilisateur existant et actif, renvoi les info de l'utilisateur complètes ainsi qu'un token de sécurité pour navigation dans les APIs",
  })
  @ApiBody({
    type: LoginUtilisateurAPI,
  })
  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  @ApiBadRequestResponse({ type: ApplicationError })
  async loginUtilisateur(
    @Body() body: LoginUtilisateurAPI,
  ): Promise<LoggedUtilisateurAPI> {
    const loggedUser = await this.connexion_v1_Usecase.loginUtilisateur(
      body.email,
      body.mot_de_passe,
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
    await this.connexion_v1_Usecase.disconnectUser(utilisateurId);
  }

  @Post('utilisateurs/logout')
  @ApiOperation({
    summary: `Déconnecte TOUS LES UTILISATEURS`,
  })
  async disconnectAll(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.connexion_v1_Usecase.disconnectAllUsers();
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
    await this.connexion_v1_Usecase.oubli_mot_de_passe(body.email);
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
    await this.connexion_v1_Usecase.modifier_mot_de_passe(
      body.email,
      body.code,
      body.mot_de_passe,
    );
    return 'OK';
  }
}
