import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { App } from '../../domain/app';
import { ImportNGCUsecase } from '../../usecase/importNGC.usecase';
import { InscriptionUsecase } from '../../usecase/inscription.usecase';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';
import { ReponseImportSituationNGCAPI } from './types/ngc/reponseImportSituationNGCAPI';
import { SituationNGCAPI } from './types/ngc/situationNGCAPI';
import { EmailAPI } from './types/utilisateur/EmailAPI';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { ValidateCodeAPI } from './types/utilisateur/onboarding/validateCodeAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { TokenAPI } from './types/utilisateur/TokenAPI';

@Controller()
@ApiTags('1 - Utilisateur - Inscription')
export class InscriptionController extends GenericControler {
  constructor(
    private readonly inscriptionUsecase: InscriptionUsecase,
    private readonly importNGCUsecase: ImportNGCUsecase,
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
    type: EmailAPI,
  })
  async createUtilisateur_v2(
    @Body() body: CreateUtilisateurAPI,
  ): Promise<EmailAPI> {
    await this.inscriptionUsecase.inscrire_utilisateur(body);
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
  @ApiOkResponse({
    type: ReponseImportSituationNGCAPI,
  })
  @ApiHeader({
    name: 'apikey',
    description: 'La clé de sécurité pour soliciter cette URL',
  })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 1000 } })
  async importFromNGC(
    @Body() body: SituationNGCAPI,
    @Headers('apikey') apikey: string,
  ): Promise<ReponseImportSituationNGCAPI> {
    if (!apikey) {
      ApplicationError.throwMissingNGC_API_KEY();
    }
    if (apikey !== App.getNGC_API_KEY()) {
      ApplicationError.throwBadNGC_API_KEY(apikey);
    }
    const result = await this.importNGCUsecase.importSituationNGC(
      body.situation,
    );
    return {
      redirect_url: `${App.getBaseURLFront()}/creation-compte/nos-gestes-climat?situationId=${
        result.id_situtation
      }&bilan_tonnes=${result.bilan_tonnes}`,
    };
  }
}
