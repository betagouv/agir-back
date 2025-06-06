import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { logoutAPI } from './types/utilisateur/logoutAPI';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import {
  LogementAPI,
  UtilisateurProfileAPI,
  UtilisateurUpdateProfileAPI,
} from './types/utilisateur/utilisateurProfileAPI';

export class ConfirmationAPI {
  @ApiProperty({ required: true })
  confirmation: string;
}
export class MobileTokenAPI {
  @ApiProperty({ required: true })
  token: string;
}

@ApiExtraModels(UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('1 - Utilisateur - Profile')
export class ProfileController extends GenericControler {
  constructor(private readonly profileUsecase: ProfileUsecase) {
    super();
  }

  @Delete('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary:
      "Suppression du compte d'un utilisateur d'id donnée, en retour URL optionnelle de logout France Connect",
  })
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: logoutAPI })
  async deleteUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<logoutAPI> {
    this.checkCallerId(req, utilisateurId);
    const result = await this.profileUsecase.deleteUtilisateur(utilisateurId);

    return {
      france_connect_logout_url: result.fc_logout_url
        ? result.fc_logout_url.toString()
        : undefined,
    };
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary: "Informations principales concernant l'utilisateur d'id donné",
  })
  @ApiOkResponse({ type: UtilisateurAPI })
  @UseGuards(AuthGuard)
  async getUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UtilisateurAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.profileUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }

    return UtilisateurAPI.mapToAPI(utilisateur);
  }
  @ApiOkResponse({ type: UtilisateurProfileAPI })
  @Get('utilisateurs/:utilisateurId/profile')
  @ApiOperation({
    summary:
      "Infromation de profile d'un utilisateur d'id donné (nom, prenom, code postal, ...)",
  })
  @UseGuards(AuthGuard)
  async getUtilisateurProfile(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UtilisateurProfileAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.profileUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }
    return UtilisateurProfileAPI.mapToAPI(utilisateur);
  }

  @ApiOkResponse({ type: LogementAPI })
  @Get('utilisateurs/:utilisateurId/logement')
  @ApiOperation({
    summary:
      "Infromation de logement d'un utilisateur d'id donné (code postal, supericie, etc)",
  })
  @UseGuards(AuthGuard)
  async getUtilisateurLogement(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<LogementAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.profileUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }
    return LogementAPI.mapToAPI(utilisateur);
  }

  @Patch('utilisateurs/:utilisateurId/profile')
  @ApiBody({
    type: UtilisateurUpdateProfileAPI,
  })
  @ApiOperation({
    summary:
      "Mise à jour des infos de profile (nom, prenom, code postal, ...) d'un utilisateur d'id donné",
  })
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: UtilisateurUpdateProfileAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.updateUtilisateurProfile(utilisateurId, body);
  }

  @Patch('utilisateurs/:utilisateurId/logement')
  @ApiBody({
    type: LogementAPI,
  })
  @ApiOperation({
    summary:
      "Mise à jour des infos de logement (code postal, superficie, etc) d'un utilisateur d'id donné",
  })
  @UseGuards(AuthGuard)
  async updateLogement(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: LogementAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.updateUtilisateurLogement(utilisateurId, body);
  }

  @Post('utilisateurs/:utilisateurId/reset')
  @ApiBody({
    type: ConfirmationAPI,
  })
  @ApiOperation({
    summary: `Reset l'utilisateur donné en argument`,
  })
  @UseGuards(AuthGuard)
  async reset(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: ConfirmationAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.reset(body.confirmation, utilisateurId);
  }

  @Post('utilisateurs/reset')
  @ApiBody({
    type: ConfirmationAPI,
  })
  @ApiOperation({
    summary: `Reset TOUS LES UTILISATEURS`,
  })
  async resetAll(@Request() req, @Body() body: ConfirmationAPI) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.profileUsecase.resetAllUsers(body.confirmation);
  }

  @Put('utilisateurs/:utilisateurId/mobile_token')
  @ApiBody({
    type: MobileTokenAPI,
  })
  @ApiOperation({
    summary: `Set le token mobile pour cet utilisateur, écrase le précédent`,
  })
  @UseGuards(AuthGuard)
  async set_mobile_token(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: MobileTokenAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.setMobileToken(body.token, utilisateurId);
  }
  @Delete('utilisateurs/:utilisateurId/mobile_token')
  @ApiOperation({
    summary: `Supprime le token mobile pour cet utilisateur`,
  })
  @UseGuards(AuthGuard)
  async delete_mobile_token(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.deleteMobileToken(utilisateurId);
  }

  @ApiTags('Z - Admin')
  @Post('utilisateurs/update_user_couverture')
  @ApiOperation({
    summary: `Met à jour le flag de couverture pour les aides pour l'ensemble des utilisateurs`,
  })
  async updateAllUserCouvertureAides(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.updateAllUserCouvertureAides();
  }
}
