import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Response,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UtilisateurUsecase } from '../../usecase/utilisateur.usecase';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiExtraModels,
  ApiOperation,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { UtilisateurAPI } from './types/utilisateur/utilisateurAPI';
import {
  LogementAPI,
  TransportAPI,
  UtilisateurProfileAPI,
} from './types/utilisateur/utilisateurProfileAPI';
import { CreateUtilisateurAPI } from './types/utilisateur/onboarding/createUtilisateurAPI';
import { LoginUtilisateurAPI } from './types/utilisateur/loginUtilisateurAPI';
import { HttpStatus } from '@nestjs/common';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { ApplicationError } from '../applicationError';
import { GenericControler } from './genericControler';
import { AuthGuard } from '../auth/guard';
import { OubliMdpAPI } from './types/utilisateur/oubliMdpAPI';
import { RenvoyerCodeAPI } from './types/utilisateur/renvoyerCodeAPI';
import { ModifierMdpAPI } from './types/utilisateur/modifierMdpAPI';

export class ConfirmationAPI {
  @ApiProperty({ required: true })
  confirmation: string;
}

@ApiExtraModels(CreateUtilisateurAPI, UtilisateurAPI)
@Controller()
@ApiBearerAuth()
@ApiTags('Utilisateur')
export class UtilisateurController extends GenericControler {
  constructor(private readonly utilisateurUsecase: UtilisateurUsecase) {
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
    await this.utilisateurUsecase.deleteUtilisateur(utilisateurId);
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({
    summary: "Infromation complètes concernant l'utilisateur d'id donné",
  })
  @ApiOkResponse({ type: UtilisateurAPI })
  @UseGuards(AuthGuard)
  async getUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<UtilisateurAPI> {
    this.checkCallerId(req, utilisateurId);

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
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

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
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

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
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

    let utilisateur = await this.utilisateurUsecase.findUtilisateurById(
      utilisateurId,
    );
    if (utilisateur == null) {
      throw new NotFoundException(`Pas d'utilisateur d'id ${utilisateurId}`);
    }

    return TransportAPI.mapToAPI(utilisateur.transport);
  }

  @Post('utilisateurs/login')
  @ApiOperation({
    summary:
      "Opération de login d'un utilisateur existant et actif, renvoi les info de l'utilisateur complètes ainsi qu'un token de sécurité pour navigation dans les APIs",
  })
  @ApiBody({
    type: LoginUtilisateurAPI,
  })
  @ApiOkResponse({ type: String })
  @ApiBadRequestResponse({ type: ApplicationError })
  async loginUtilisateur(
    @Body() body: LoginUtilisateurAPI,
    @Response() res,
  ): Promise<LoggedUtilisateurAPI> {
    const loggedUser = await this.utilisateurUsecase.loginUtilisateur(
      body.email,
      body.mot_de_passe,
    );
    const response = LoggedUtilisateurAPI.mapToAPI(
      loggedUser.token,
      loggedUser.utilisateur,
    );
    return res.status(HttpStatus.OK).json(response);
  }

  @Patch('utilisateurs/:utilisateurId/profile')
  @ApiBody({
    type: UtilisateurProfileAPI,
  })
  @ApiOperation({
    summary:
      "Mise à jour des infos de profile (nom, prenom, code postal, ...) d'un utilisateur d'id donné",
  })
  @UseGuards(AuthGuard)
  async updateProfile(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Body() body: UtilisateurProfileAPI,
  ) {
    this.checkCallerId(req, utilisateurId);
    await this.utilisateurUsecase.updateUtilisateurProfile(utilisateurId, body);
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
    await this.utilisateurUsecase.updateUtilisateurLogement(
      utilisateurId,
      body,
    );
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
    await this.utilisateurUsecase.updateUtilisateurTransport(
      utilisateurId,
      body,
    );
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
    await this.utilisateurUsecase.reset(body.confirmation, utilisateurId);
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
    await this.utilisateurUsecase.resetAllUsers(body.confirmation);
  }

  @Post('utilisateurs/oubli_mot_de_passe')
  @ApiOperation({
    summary:
      "Déclenche une procédure d'oubli de mot de passe, envoi un code par mail à l'email, si le mail existe en base",
  })
  @ApiBody({
    type: OubliMdpAPI,
  })
  @ApiOkResponse({ type: RenvoyerCodeAPI })
  @ApiBadRequestResponse({ type: ApplicationError })
  async oubli_mdp(
    @Body() body: OubliMdpAPI,
    @Response() res,
  ): Promise<RenvoyerCodeAPI> {
    await this.utilisateurUsecase.oubli_mot_de_passe(body.email);
    return res.status(HttpStatus.OK).json({ email: body.email });
  }

  @Post('utilisateurs/modifier_mot_de_passe')
  @ApiOperation({
    summary:
      "Modifie le mod de passe d'un utilisateur en fournissant son email et le code reçu par email",
  })
  @ApiBody({
    type: ModifierMdpAPI,
  })
  @ApiBadRequestResponse({ type: ApplicationError })
  async modifier_mdp(@Body() body: ModifierMdpAPI, @Response() res) {
    await this.utilisateurUsecase.modifier_mot_de_passe(
      body.email,
      body.code,
      body.mot_de_passe,
    );
    return res.status(HttpStatus.OK).json('OK');
  }
}
