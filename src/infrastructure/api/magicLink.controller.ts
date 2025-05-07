import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
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
  @ApiOperation({
    summary: 'envoie une lien de connexion au mail argument',
  })
  @ApiBody({
    type: ProspectSubmitAPI,
  })
  @UseGuards(ThrottlerGuard)
  async sendMagicLink(@Body() body: ProspectSubmitAPI) {
    await this.magicLinkUsecase.sendLink(body.email);
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
  async post_validateMagicLink(@Body() body: ValidateCodeAPI) {
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
