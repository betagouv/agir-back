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
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProspectSubmitAPI } from './types/utilisateur/onboarding/prospectSubmitAPI';
import { GenericControler } from './genericControler';
import { MagicLinkUsecase } from '../../usecase/magicLink.usecase';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoggedUtilisateurAPI } from './types/utilisateur/loggedUtilisateurAPI';

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
    summary: 'envoie une lien de connexion au mail argument',
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
}
