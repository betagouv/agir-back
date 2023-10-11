import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import {
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  getSchemaPath,
  ApiExtraModels,
} from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import { UtilisateurProfileAPI } from './types/utilisateur/utilisateurProfileAPI';
import { CreateUtilisateurAPI } from './types/utilisateur/createUtilisateurAPI';
import { OnboardingDataAPI } from './types/utilisateur/onboardingDataAPI';
import { OnboardingDataImpactAPI } from './types/utilisateur/onboardingDataImpactAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { HttpStatus } from '@nestjs/common';

@ApiExtraModels(CreateUtilisateurAPI)
@Controller()
@ApiTags('Utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {}

  @Get('utilisateurs')
  @ApiQuery({
    name: 'nom',
    type: String,
    description: "Nom optionel de l'utilisateur",
    required: false,
  })
  @ApiOkResponse({ type: [UtilisateurAPI] })
  async listUtilisateurs(
    @Query('nom') nom?: string,
  ): Promise<UtilisateurAPI[]> {
    if (nom === null) {
      return this.utilisateurUsecase.listUtilisateurs() as any;
    } else {
      return this.utilisateurUsecase.findUtilisateursByNom(nom) as any;
    }
  }

  @Delete('utilisateurs/:id')
  async deleteUtilisateurById(@Param('id') id: string) {
    await this.utilisateurUsecase.deleteUtilisateur(id);
  }

  @Get('utilisateurs/:id')
  @ApiOkResponse({ type: UtilisateurAPI })
  async getUtilisateurById(@Param('id') id: string): Promise<UtilisateurAPI> {
    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(id);
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${id}`);
    }
    return {
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      code_postal: utilisateur.code_postal,
      points: utilisateur.points,
      quizzProfile: utilisateur.quizzProfile.getData(),
      created_at: utilisateur.created_at,
      badges: utilisateur.badges,
    };
  }
  @ApiOkResponse({ type: UtilisateurProfileAPI })
  @Get('utilisateurs/:id/profile')
  async getUtilisateurProfileById(
    @Param('id') utilisateurId: string,
  ): Promise<UtilisateurProfileAPI> {
    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }
    return {
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      code_postal: utilisateur.code_postal,
    };
  }
  @Post('utilisateurs/login')
  @ApiBody({
    type: LoginUtilisateurAPI,
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: "le token d'authentification" },
      },
    },
  })
  async loginUtilisateur(@Body() body: LoginUtilisateurAPI, @Response() res) {
    try {
      const token = await this.utilisateurUsecase.loginUtilisateur(
        body.email,
        body.mot_de_passe,
      );
      return res.status(HttpStatus.OK).json({ token: token });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Post('utilisateurs')
  @ApiBody({
    type: CreateUtilisateurAPI,
  })
  @ApiOkResponse({
    description: "l'utilisateur crée",
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: "id unique de l'utiliateur" },
      },
    },
  })
  async createUtilisateur(@Body() body: CreateUtilisateurAPI, @Response() res) {
    try {
      const utilisateur = await this.utilisateurUsecase.createUtilisateur(body);
      return res
        .header(
          'location',
          `https://agir.gouv.fr/api/utiliateurs/${utilisateur.id}`,
        )
        .json(utilisateur);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Post('utilisateurs/evaluate-onboarding')
  @ApiBody({
    type: OnboardingDataAPI,
  })
  @ApiOkResponse({
    type: OnboardingDataImpactAPI,
  })
  async evaluateOnboardingData(@Body() body: OnboardingDataAPI) {
    return this.utilisateurUsecase.evaluateOnboardingData(body);
  }
  @Patch('utilisateurs/:id/profile')
  async updateProfile(
    @Param('id') utilisateurId: string,
    @Body() body: UtilisateurProfileAPI,
  ) {
    return this.utilisateurUsecase.updateUtilisateurProfile(utilisateurId, {
      email: body.email,
      nom: body.nom,
      prenom: body.prenom,
      code_postal: body.code_postal,
    });
  }
}
