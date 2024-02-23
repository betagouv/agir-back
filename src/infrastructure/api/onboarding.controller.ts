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

@ApiExtraModels(CreateUtilisateurAPI)
@Controller()
@ApiTags('Onboarding Utilisateur')
export class OnboardingController extends GenericControler {
  constructor(private readonly onboardingUsecase: OnboardingUsecase) {
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
}
