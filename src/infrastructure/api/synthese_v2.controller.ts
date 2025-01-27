import { Controller, Get, Param, Query, Response } from '@nestjs/common';
import { Response as Res } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GenericControler } from './genericControler';
import { ArticleRepository } from '../repository/article.repository';
import { App } from '../../domain/app';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { Scope } from '../../domain/utilisateur/utilisateur';
import { AideRepository } from '../repository/aide.repository';
import { RechercheServiceManager } from '../../domain/bibliotheque_services/recherche/rechercheServiceManager';
import { ServiceRechercheID } from '../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { FiltreRecherche } from '../../domain/bibliotheque_services/recherche/filtreRecherche';
import { CommuneRepository } from '../repository/commune/commune.repository';
import { CategorieRecherche } from '../../domain/bibliotheque_services/recherche/categorieRecherche';
import { Thematique } from '../../domain/contenu/thematique';
import { ArticleDefinition } from '../../domain/contenu/articleDefinition';
import { AideDefinition } from '../../domain/aides/aideDefinition';

export class ArticleLocalAPI {
  @ApiProperty() id: string;
  @ApiProperty() thematique: string;
  @ApiProperty() titre: string;
}
export class AideLocalAPI {
  @ApiProperty() id: string;
  @ApiProperty({ type: [String] }) thematiques: string[];
  @ApiProperty() titre: string;
}
export class SyntheseAPI {
  @ApiProperty({ type: [AideLocalAPI] })
  liste_id_aides_region: AideLocalAPI[];
}

@ApiTags('Previews')
@Controller()
@ApiBearerAuth()
export class Synthese_v2Controller extends GenericControler {
  constructor(
    private userRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private communeRepository: CommuneRepository,
    private aideRepository: AideRepository,
    private rechercheServiceManager: RechercheServiceManager,
  ) {
    super();
  }

  @Get('code_postal_synthese_v2/:code_insee')
  @ApiQuery({
    name: 'rayon',
    type: Number,
    required: false,
    description: `rayon en mètres de recherche, 3000 metres par défaut`,
  })
  @ApiOkResponse({ type: SyntheseAPI })
  async code_postal_synthese(
    @Param('code_insee') code_insee: string,
    @Query('rayon') rayon: number,
    @Response() res: Res,
  ): Promise<any> {
    if (!rayon) {
      rayon = 3000;
    } else {
      rayon = parseInt('' + rayon);
    }

    if (this.communeRepository.isCodeInseeEPCI(code_insee)) {
    }

    const result: SyntheseAPI = null;

    return res.json(result);
  }
}
