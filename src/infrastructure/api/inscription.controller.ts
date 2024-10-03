import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
} from '@nestjs/swagger';
import { ProspectSubmitAPI } from './types/utilisateur/onboarding/prospectSubmitAPI';
import { ValidateCodeAPI } from './types/utilisateur/onboarding/validateCodeAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { GenericControler } from './genericControler';
import { TokenAPI } from './types/utilisateur/TokenAPI';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { InscriptionUsecase } from '../../usecase/inscription.usecase';
import { CreateUtilisateurAPI_v2 } from './types/utilisateur/onboarding/createUtilisateurAPI_v2';

@Controller()
@ApiTags('1 - Utilisateur - Inscription')
export class InscriptionController extends GenericControler {
  constructor(private readonly inscription_v2_Usecase: InscriptionUsecase) {
    super();
  }

  @Post('utilisateurs_v2')
  @ApiOperation({
    summary: "création d'un compte, seul email et mot de passe obligatoire",
  })
  @ApiBody({
    type: CreateUtilisateurAPI_v2,
  })
  @ApiOkResponse({
    type: ProspectSubmitAPI,
  })
  async createUtilisateur_v2(@Body() body: CreateUtilisateurAPI_v2) {
    await this.inscription_v2_Usecase.createUtilisateur(body);
    return EmailAPI.mapToAPI(body.email);
  }

  @Post('utilisateurs/valider')
  @ApiOperation({
    summary:
      "valide l'inscription de l'utilisateur d'un email donné avec en entrée un code (code reçu par email), renvoie le token de sécurité",
  })
  @ApiBody({
    type: ValidateCodeAPI,
  })
  @ApiOkResponse({
    type: TokenAPI,
  })
  async validerCode(@Body() body: ValidateCodeAPI) {
    const loggedUser = await this.inscription_v2_Usecase.validateCode(
      body.email,
      body.code,
    );
    return TokenAPI.mapToAPI(loggedUser.token);
  }

  @Post('utilisateurs/renvoyer_code')
  @ApiOperation({
    summary:
      "renvoi le code de validation de l'inscription par email à l'email précisé dans la route",
  })
  @ApiBody({
    type: RenvoyerCodeAPI,
  })
  async renvoyerCode(@Body() body: RenvoyerCodeAPI) {
    await this.inscription_v2_Usecase.renvoyerCodeInscription(body.email);
  }
}
