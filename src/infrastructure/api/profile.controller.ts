import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import {
  LogementAPI,
  TransportAPI,
  UtilisateurProfileAPI,
  UtilisateurUpdateProfileAPI,
} from './types/utilisateur/utilisateurProfileAPI';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';

export class ConfirmationAPI {
  @ApiProperty({ required: true })
  confirmation: string;
}

@ApiExtraModels(CreateUtilisateurAPI, UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('1 - Utilisateur - Profile')
export class ProfileController extends GenericControler {
  constructor(private readonly profileUsecase: ProfileUsecase) {
    super();
  }

  @Delete('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary: "Suppression du compte d'un utilisateur d'id donnée",
  })
  @UseGuards(AuthGuard)
  async deleteUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.deleteUtilisateur(utilisateurId);
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
    return LogementAPI.mapToAPI(utilisateur.logement);
  }

  @ApiOkResponse({ type: TransportAPI })
  @Get('utilisateurs/:utilisateurId/transport')
  @ApiOperation({
    summary:
      "Information de transport d'un utilisateur d'id donné (frequence avions, transports du quotidien)",
  })
  @UseGuards(AuthGuard)
  async getUtilisateurTransport(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<TransportAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.profileUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }

    return TransportAPI.mapToAPI(utilisateur.transport);
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

  @Patch('utilisateurs/:utilisateurId/transport')
  @ApiBody({
    type: TransportAPI,
  })
  @ApiOperation({
    summary:
      'Mise à jour des infos de transport (frequence avion, transports du quotidien, etc)',
  })
  @UseGuards(AuthGuard)
  async updateTransport(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: TransportAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.profileUsecase.updateUtilisateurTransport(utilisateurId, body);
  }

  @Post('utilisateurs/:utilisateurId/reset')
  @ApiBody({
    type: ConfirmationAPI,
  })
  @ApiOperation({
    summary: `Reset l'utilisateur donné en argument, tout sauf l'onboarding`,
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
    summary: `Reset TOUS LES UTILISATEURS, tout sauf l'onboarding`,
  })
  async resetAll(@Request() req, @Body() body: ConfirmationAPI) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.profileUsecase.resetAllUsers(body.confirmation);
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
