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
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { Scope } from '../../domain/utilisateur/utilisateur';
import { AideRepository } from '../repository/aide.repository';
import { RechercheServiceManager } from '../../domain/bibliotheque_services/recherche/rechercheServiceManager';
import { CommuneRepository } from '../repository/commune/commune.repository';
import { ContenuLocal } from '../../domain/contenu/contenuLocal';

export class ArticleLocalAPI {
  @ApiProperty() id: string;
  @ApiProperty() thematique: string;
  @ApiProperty() titre: string;
}
export class ContentAPI {
  @ApiProperty() id: string;
  @ApiProperty({ type: [String] }) thematiques: string[];
  @ApiProperty() titre: string;

  static mapContent(content: ContenuLocal): ContentAPI {
    return {
      id: content.content_id,
      titre: content.titre,
      thematiques: content.thematiques,
    };
  }
}
export class SyntheseAPI {
  @ApiProperty({ type: [ContentAPI] })
  liste_aides_region: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_aides_departement: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_aides_locales: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_aides_nationales: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_articles_region: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_articles_departement: ContentAPI[];

  @ApiProperty({ type: [ContentAPI] })
  liste_articles_locales: ContentAPI[];

  @ApiProperty() nom_region: string;
  @ApiProperty() nom_departement: string;
  @ApiProperty() nom_commune_ou_collectivite: string;
  @ApiProperty() liste_communes_dans_EPCI: string[];
  @ApiProperty() est_EPCI: boolean;

  @ApiProperty() nombre_inscrits_total: number;
  @ApiProperty() nombre_inscrits_local: number;
  @ApiProperty() nombre_points_moyen: number;
  @ApiProperty() nombre_defis_encours: number;
  @ApiProperty() nombre_defis_realises: number;
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
    @Param('code_insee') code_insee_input: string,
    @Query('rayon') rayon: number,
    @Response() res: Res,
  ): Promise<any> {
    if (!rayon) {
      rayon = 3000;
    } else {
      rayon = parseInt('' + rayon);
    }

    const liste_aides = await this.aideRepository.listAll();
    const liste_articles = await this.articleRepository.searchArticles({});

    const IS_CODE_EPCI =
      this.communeRepository.isCodeInseeEPCI(code_insee_input);

    let code_region_cible;
    let code_departement_cible;
    let code_commune_cible_ou_exemple;
    let nom_commune_ou_EPCI;
    let liste_codes_communes_of_input: string[];
    let liste_noms_communes_of_input: string[];

    if (IS_CODE_EPCI) {
      const EPCI = this.communeRepository.getEPCIByCode(code_insee_input);
      liste_noms_communes_of_input = EPCI.membres.map((m) => m.nom);

      liste_codes_communes_of_input =
        this.communeRepository.getListeCodesCommuneParCodeEPCI(
          code_insee_input,
        );

      code_commune_cible_ou_exemple = liste_codes_communes_of_input[0];
      nom_commune_ou_EPCI = EPCI.nom;
    } else {
      liste_codes_communes_of_input = [code_insee_input];
      code_commune_cible_ou_exemple = code_insee_input;
      nom_commune_ou_EPCI =
        this.communeRepository.getCommuneByCodeINSEE(code_insee_input).nom;
      liste_noms_communes_of_input = [];
    }

    let total_users = await this.userRepository.nombreTotalUtilisateurs();
    let local_users = await this.userRepository.findUserIdsByCodesCommune(
      liste_codes_communes_of_input,
    );

    const region_departement =
      this.communeRepository.findDepartementRegionByCodeCommune(
        code_commune_cible_ou_exemple,
      );
    code_departement_cible = region_departement.code_departement;
    code_region_cible = region_departement.code_region;

    const categorisation_aides = this.rangeContenuParLocalisation(
      liste_aides,
      code_region_cible,
      code_departement_cible,
      IS_CODE_EPCI,
      code_insee_input,
      liste_codes_communes_of_input,
    );

    const categorisation_articles = this.rangeContenuParLocalisation(
      liste_articles,
      code_region_cible,
      code_departement_cible,
      IS_CODE_EPCI,
      code_insee_input,
      liste_codes_communes_of_input,
    );

    let nombre_points_moyen = 0;
    let nombre_defis_encours = 0;
    let nombre_defis_realises = 0;

    for (const userid of local_users) {
      const user = await this.userRepository.getById(userid, [
        Scope.gamification,
        Scope.defis,
      ]);
      nombre_points_moyen += user.gamification.points;
      nombre_defis_encours += user.defi_history.getNombreDefisEnCours();
      nombre_defis_realises += user.defi_history.getNombreDefisRealises();
    }

    // ###########################################################################
    // ######### BUILD RESULT
    // ###########################################################################
    const result: SyntheseAPI = new SyntheseAPI();

    result.nom_departement = this.communeRepository.getNomDepartementByCode(
      code_departement_cible,
    );
    result.nom_region =
      this.communeRepository.getNomRegionByCode(code_region_cible);
    result.nom_commune_ou_collectivite = nom_commune_ou_EPCI;
    result.est_EPCI = IS_CODE_EPCI;
    result.liste_communes_dans_EPCI = liste_noms_communes_of_input;
    result.nombre_inscrits_total = total_users;
    result.nombre_inscrits_local = local_users.length;
    result.nombre_points_moyen = nombre_points_moyen;
    result.nombre_defis_encours = nombre_defis_encours;
    result.nombre_defis_realises = nombre_defis_realises;

    result.liste_aides_region = categorisation_aides.regional;
    result.liste_aides_departement = categorisation_aides.departemental;
    result.liste_aides_locales = categorisation_aides.local;
    result.liste_aides_nationales = categorisation_aides.national;

    result.liste_articles_region = categorisation_articles.regional;
    result.liste_articles_departement = categorisation_articles.departemental;
    result.liste_articles_locales = categorisation_articles.local;

    return res.json(result);
  }

  private rangeContenuParLocalisation(
    liste_contenu: ContenuLocal[],
    code_region_cible: string,
    code_departement_cible: string,
    IS_CODE_EPCI: boolean,
    code_insee_input: string,
    liste_codes_communes_of_input: string[],
  ): {
    national: ContentAPI[];
    regional: ContentAPI[];
    departemental: ContentAPI[];
    local: ContentAPI[];
  } {
    const result = {
      national: [],
      regional: [],
      departemental: [],
      local: [],
    };
    const RESULT_liste_locale: Map<string, ContentAPI> = new Map();

    for (const content_def of liste_contenu) {
      if (
        content_def.codes_postaux.length === 0 &&
        content_def.codes_departement.length === 0 &&
        content_def.codes_region.length === 0 &&
        content_def.include_codes_commune.length === 0
      ) {
        result.national.push(ContentAPI.mapContent(content_def));
        continue;
      }
      if (content_def.codes_region.includes(code_region_cible)) {
        result.regional.push(ContentAPI.mapContent(content_def));
      }
      if (content_def.codes_departement.includes(code_departement_cible)) {
        result.departemental.push(ContentAPI.mapContent(content_def));
      }
      for (const code_postal of content_def.codes_postaux) {
        const liste_codes_communes_of_code_postal =
          this.communeRepository.getListCodesCommunesParCodePostal(code_postal);

        if (IS_CODE_EPCI) {
          for (const un_code_commune_du_code_postal of liste_codes_communes_of_code_postal) {
            if (
              liste_codes_communes_of_input.includes(
                un_code_commune_du_code_postal,
              )
            ) {
              RESULT_liste_locale.set(
                content_def.content_id,
                ContentAPI.mapContent(content_def),
              );
            }
          }
        } else {
          if (liste_codes_communes_of_code_postal.includes(code_insee_input)) {
            RESULT_liste_locale.set(
              content_def.content_id,
              ContentAPI.mapContent(content_def),
            );
          }
        }
      }
      if (content_def.include_codes_commune.includes(code_insee_input)) {
        RESULT_liste_locale.set(
          content_def.content_id,
          ContentAPI.mapContent(content_def),
        );
      }
    }
    result.local = Array.from(RESULT_liste_locale.values());
    return result;
  }
}
