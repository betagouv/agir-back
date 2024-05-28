import { Body, Controller, Post } from '@nestjs/common';
import { OnboardingUsecase } from '../../usecase/onboarding.usecase';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { OnboardingDataAPI } from './types/utilisateur/onboarding/onboardingDataAPI';
import { OnboardingDataImpactAPI } from './types/utilisateur/onboarding/onboardingDataImpactAPI';
import { GenericControler } from './genericControler';
import {
  CheckWhitelisteAPI,
  UtilisateurAttenteAPI,
  ReponseCheckWhitelisteAPI,
} from './types/utilisateur/onboarding/checkWhitelisteAPI';
import { FileAttenteUsecase } from '../../../src/usecase/fileAttente.usecase';

@ApiExtraModels(CreateUtilisateurAPI)
@Controller()
@ApiTags('Onboarding Utilisateur')
export class OnboardingController extends GenericControler {
  constructor(
    private readonly onboardingUsecase: OnboardingUsecase,
    private readonly fileAttenteUsecase: FileAttenteUsecase,
  ) {
    super();
  }

  @Post('utilisateurs/evaluate-onboarding')
  @ApiBody({
    type: OnboardingDataAPI,
  })
  @ApiOperation({
    summary:
      "calcul le score de l'utilisateur sur les différentes thématiques, le compare par rapport aux autres de la base",
  })
  @ApiOkResponse({
    type: OnboardingDataImpactAPI,
  })
  async evaluateOnboardingData(
    @Body() body: OnboardingDataAPI,
  ): Promise<OnboardingDataImpactAPI> {
    return this.onboardingUsecase.evaluateOnboardingData(body);
  }

  @Post('utilisateurs/check_whiteliste')
  @ApiBody({
    type: CheckWhitelisteAPI,
  })
  @ApiOperation({
    summary:
      "vérifie si le mail fourni est white listé pour le Beta de l'application",
  })
  @ApiOkResponse({
    type: ReponseCheckWhitelisteAPI,
  })
  async checkWhiteListe(
    @Body() body: CheckWhitelisteAPI,
  ): Promise<ReponseCheckWhitelisteAPI> {
    const has_access = this.fileAttenteUsecase.hasAccess(body.email);
    return {
      is_whitelisted: has_access,
    };
  }

  @Post('utilisateurs/file_attente')
  @ApiBody({
    type: UtilisateurAttenteAPI,
  })
  @ApiOperation({
    summary: "ajoute l'email à la liste d'attente pour participer à la Beta",
  })
  async addToFileAttente(@Body() body: UtilisateurAttenteAPI) {
    await this.fileAttenteUsecase.add({
      email: body.email,
      code_postal: body.code_postal,
      code_profil: body.code_profil,
    });
  }
}
