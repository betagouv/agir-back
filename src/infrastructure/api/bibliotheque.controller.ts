import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guard';
import { GenericControler } from './genericControler';
import { BibliothequeAPI } from './types/contenu/contenuBiblioAPI';
import { BibliothequeUsecase } from '../../../src/usecase/bibliotheque.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Bibliotheque')
export class BibliothequeController extends GenericControler {
  constructor(private readonly bibliothequeUsecase: BibliothequeUsecase) {
    super();
  }

  @Get('utilisateurs/:utilisateurId/bibliotheque')
  @ApiOkResponse({ type: BibliothequeAPI })
  @UseGuards(AuthGuard)
  async getUserRecommandation(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<BibliothequeAPI> {
    this.checkCallerId(req, utilisateurId);

    const biblio = await this.bibliothequeUsecase.listContenuDejaConsulte(
      utilisateurId,
    );
    return BibliothequeAPI.mapToAPI(biblio);
  }
}
