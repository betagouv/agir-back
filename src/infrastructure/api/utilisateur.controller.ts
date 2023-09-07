import { Utilisateur } from '../../domain/utilisateur';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Response,
} from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import { ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateurAPI';
import { UtilisateurProfileAPI } from './types/utilisateurProfileAPI';

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
  async listUtilisateurs(
    @Query('name') name?: string,
  ): Promise<UtilisateurAPI[]> {
    if (name === null) {
      return this.utilisateurUsecase.listUtilisateurs() as any;
    } else {
      return this.utilisateurUsecase.findUtilisateursByName(name) as any;
    }
  }

  @Get('utilisateurs/:id')
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
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: "nom de l'utilisateur à créer" },
        email: { type: 'string', description: "email de l'utilisateur" },
      },
    },
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
  async createUtilisateur(
    @Body('name') name: string,
    @Body('email') email: string,
    @Response() res,
  ) {
    const utilisateur =
      await this.utilisateurUsecase.createUtilisateurByOptionalNameAndEmail(
        name,
        email,
      );
    return res
      .header(
        'location',
        `https://agir.gouv.fr/api/utiliateurs/${utilisateur.id}`,
      )
      .json(utilisateur);
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
