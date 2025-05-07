import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MagicLinkUsecase } from '../../usecase/magicLink.usecase';
import { GenericControler } from './genericControler';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';
import { ProspectSubmitAPI } from './types/utilisateur/onboarding/prospectSubmitAPI';
import { ValidateCodeAPI } from './types/utilisateur/onboarding/validateCodeAPI';

@Controller()
@ApiTags('Magic Link')
export class MagicLinkController extends GenericControler {
  constructor(private readonly magicLinkUsecase: MagicLinkUsecase) {
    super();
  }

  @Post('utilisateurs/send_magic_link')
  @ApiHeader({
    name: 'origin',
    required: false,

    description:
      'Base url qui va être utilisée pour générer le lien présent dans le mail, pour test en DEV seulement',
  })
  @ApiOperation({
    summary: 'envoie une lien de connexion au mail argument',
  })
  @ApiBody({
    type: ProspectSubmitAPI,
  })
  @UseGuards(ThrottlerGuard)
  async sendMagicLink(
    @Body() body: ProspectSubmitAPI,
    @Headers('origin') origin?: string,
  ) {
    await this.magicLinkUsecase.sendLink(
      body.email,
      body.source_inscription,
      origin,
    );
  }

  @ApiParam({
    name: 'email',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'code',
    type: String,
    required: true,
  })
  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  @ApiOperation({
    summary: `Crée et/ou connect l'utilisateur`,
  })
  @UseGuards(ThrottlerGuard)
  @Get('utilisateurs/:email/login')
  async validateMagicLink(
    @Query('code') code: string,
    @Param('email') email: string,
  ) {
    const loggedUser = await this.magicLinkUsecase.validateLink(email, code);
    return LoggedUtilisateurAPI.mapToAPI(
      loggedUser.token,
      loggedUser.utilisateur,
    );
  }

  @ApiOkResponse({ type: LoggedUtilisateurAPI })
  @ApiOperation({
    summary: `Crée et/ou connect l'utilisateur`,
  })
  @UseGuards(ThrottlerGuard)
  @Post('utilisateurs/magic_link_login')
  @ApiBody({
    type: ValidateCodeAPI,
  })
  async post_validateMagicLink(
    @Body() body: ValidateCodeAPI,
  ): Promise<LoggedUtilisateurAPI> {
    const loggedUser = await this.magicLinkUsecase.validateLink(
      body.email,
      body.code,
    );
    return LoggedUtilisateurAPI.mapToAPI(
      loggedUser.token,
      loggedUser.utilisateur,
    );
  }
}
