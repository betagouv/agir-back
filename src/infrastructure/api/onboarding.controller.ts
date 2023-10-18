import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { OnboardingUsecase } from '../../usecase/onboarding.usecase';
import {
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUtilisateurAPI } from './types/utilisateur/createUtilisateurAPI';
import { OnboardingDataAPI } from './types/utilisateur/onboardingDataAPI';
import { OnboardingDataImpactAPI } from './types/utilisateur/onboardingDataImpactAPI';
import { HttpStatus } from '@nestjs/common';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';

@ApiExtraModels(CreateUtilisateurAPI)
@Controller()
@ApiTags('Onboarding Utilisateur')
export class OnboardingController {
  constructor(private readonly onboardingUsecase: OnboardingUsecase) {}

  @Post('utilisateurs')
  @ApiOperation({
    summary:
      "création d'un compte, qui doit ensuite être activé via la soumission d'un code",
  })
  @ApiBody({
    type: CreateUtilisateurAPI,
  })
  async createUtilisateur(@Body() body: CreateUtilisateurAPI, @Response() res) {
    try {
      await this.onboardingUsecase.createUtilisateur(body);
      return res
        .header(
          'location',
          `https://agir.gouv.fr/api/utiliateurs/${body.email}`,
        )
        .json('user to activate');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
  async evaluateOnboardingData(@Body() body: OnboardingDataAPI) {
    return this.onboardingUsecase.evaluateOnboardingData(body);
  }

  @Post('utilisateurs/:email/valider')
  @ApiOperation({
    summary:
      "valide l'inscription de l'utilisateur d'un email donné avec en entrée un code (code reçu par email), renvoie toutes les infos de l'utilisateur ainsi qu'un token de sécurité",
  })
  @ApiQuery({
    name: 'code',
    type: String,
    description: 'code de validation de la création de compte',
    required: true,
  })
  @ApiOkResponse({
    type: LoggedUtilisateurAPI,
  })
  async validerCode(
    @Param('email') email: string,
    @Query('code') code: string,
    @Response() res,
  ) {
    try {
      const loggedUser = await this.onboardingUsecase.validateCode(email, code);
      const response: LoggedUtilisateurAPI = {
        utilisateur: {
          id: loggedUser.utilisateur.id,
          nom: loggedUser.utilisateur.nom,
          prenom: loggedUser.utilisateur.prenom,
          code_postal: loggedUser.utilisateur.code_postal,
          email: loggedUser.utilisateur.email,
          points: loggedUser.utilisateur.points,
          quizzProfile: loggedUser.utilisateur.quizzProfile.getData(),
          created_at: loggedUser.utilisateur.created_at,
          badges: loggedUser.utilisateur.badges,
        },
        token: loggedUser.token,
      };
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('utilisateurs/:email/renvoyer_code')
  @ApiOperation({
    summary:
      "renvoi le code de validation de l'inscription par email à l'email précisé dans la route",
  })
  async renvoyerCode(@Param('email') email: string, @Response() res) {
    try {
      await this.onboardingUsecase.renvoyerCode(email);
      return res.status(HttpStatus.OK).json('code renvoyé');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
