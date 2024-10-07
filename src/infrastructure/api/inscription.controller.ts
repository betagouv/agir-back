import { Body, Controller, Post, Redirect, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiFoundResponse,
} from '@nestjs/swagger';
import { ProspectSubmitAPI } from './types/utilisateur/onboarding/prospectSubmitAPI';
import { ValidateCodeAPI } from './types/utilisateur/onboarding/validateCodeAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { GenericControler } from './genericControler';
import { TokenAPI } from './types/utilisateur/TokenAPI';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { InscriptionUsecase } from '../../usecase/inscription.usecase';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { ThrottlerGuard } from '@nestjs/throttler';
import { App } from '../../domain/app';
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { BilanUsecase } from '../../usecase/bilan.usecase';

@Controller()
@ApiTags('1 - Utilisateur - Inscription')
export class InscriptionController extends GenericControler {
  constructor(
    private readonly inscriptionUsecase: InscriptionUsecase,
    private readonly bilanUsecase: BilanUsecase,
  ) {
    super();
  }

  @Post('utilisateurs_v2')
  @ApiOperation({
    summary: "création d'un compte, seul email et mot de passe obligatoire",
  })
  @ApiBody({
    type: CreateUtilisateurAPI,
  })
  @ApiOkResponse({
    type: ProspectSubmitAPI,
  })
  async createUtilisateur_v2(@Body() body: CreateUtilisateurAPI) {
    await this.inscriptionUsecase.createUtilisateur(body);
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
    const loggedUser = await this.inscriptionUsecase.validateCode(
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
    await this.inscriptionUsecase.renvoyerCodeInscription(body.email);
  }

  @ApiBody({ type: SituationNGCAPI })
  @Post('bilan/importFromNGC')
  @ApiFoundResponse({
    description:
      "Redirige vers la page d'inscription avec 2 param d'URL : situation_id et bilan_tonnes. L'url a la forme DOMAINE/creation-compte?situationId=XYZ&bilan_tonnes=8",
  })
  @Redirect(
    'https://FRONT/creation-compte?situationId=1234&bilan_tonnes=8',
    302,
  )
  @UseGuards(ThrottlerGuard)
  async importFromNGC(@Body() body: SituationNGCAPI) {
    const result = await this.bilanUsecase.importSituationNGC(body.situation);
    return {
      url: `${App.getBaseURLFront()}/creation-compte?situationId=${
        result.id_situtation
      }&bilan_tonnes=${result.bilan_tonnes}`,
    };
  }
}
