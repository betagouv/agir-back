import {
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
import { OnboardingDataImpactAPI } from './types/utilisateur/onboardingDataAPI copy';

@ApiExtraModels(CreateUtilisateurAPI)
@Controller()
@ApiTags('Utilisateur')
export class UtilisateurController {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {}

  @Get('utilisateurs')
  @ApiQuery({
    name: 'name',
    type: String,
    description: "Nom optionel de l'uilisateur",
    required: false,
  })
  @ApiOkResponse({ type: [UtilisateurAPI] })
  async listUtilisateurs(
    @Query('name') name?: string,
  ): Promise<UtilisateurAPI[]> {
    if (name === null) {
      return this.utilisateurUsecase.listUtilisateurs() as any;
    } else {
      return this.utilisateurUsecase.findUtilisateursByName(name) as any;
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
      name: utilisateur.name,
      email: utilisateur.email,
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
      name: utilisateur.name,
      email: utilisateur.email,
      code_postal: utilisateur.code_postal,
    };
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
        name: { type: 'string', description: "nom de l'utilisateur créé" },
      },
    },
  })
  async createUtilisateur(@Body() body: CreateUtilisateurAPI, @Response() res) {
    const utilisateur = await this.utilisateurUsecase.createUtilisateur(body);
    return res
      .header(
        'location',
        `https://agir.gouv.fr/api/utiliateurs/${utilisateur.id}`,
      )
      .json(utilisateur);
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
      name: body.name,
      email: body.email,
      code_postal: body.code_postal,
    });
  }
}
