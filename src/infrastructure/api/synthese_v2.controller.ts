import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ContenuLocal } from '../../domain/contenu/contenuLocal';
import { Thematique } from '../../domain/thematique/thematique';
import { Scope } from '../../domain/utilisateur/utilisateur';
import { ApplicationError } from '../applicationError';
import { ActionRepository } from '../repository/action.repository';
import { AideRepository } from '../repository/aide.repository';
import { ArticleRepository } from '../repository/article.repository';
import { CommuneRepository } from '../repository/commune/commune.repository';
import { StatistiqueExternalRepository } from '../repository/statitstique.external.repository';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { GenericControler } from './genericControler';

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
  @ApiProperty() liste_codes_postaux_dans_EPCI: string[];
  @ApiProperty() est_EPCI: boolean;

  @ApiProperty() nombre_inscrits_total: number;
  @ApiProperty() nombre_inscrits_local: number;
  @ApiProperty() nombre_inscrits_local_dernier_mois: number;
  @ApiProperty() nombre_inscrits_total_dernier_mois: number;
  @ApiProperty() nombre_actifs_local_dernier_mois: number;
  @ApiProperty() nombre_points_moyen: number;
  @ApiProperty() pourcent_actions_logement: number;
  @ApiProperty() pourcent_actions_transport: number;
  @ApiProperty() pourcent_actions_consommation: number;
  @ApiProperty() pourcent_actions_alimentation: number;
}

@ApiTags('Collectivités')
@Controller()
@ApiBearerAuth()
export class Synthese_v2Controller extends GenericControler {
  constructor(
    private userRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private actionRepository: ActionRepository,
    private communeRepository: CommuneRepository,
    private aideRepository: AideRepository,
    private statistiqueExternalRepository: StatistiqueExternalRepository,
  ) {
    super();
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 1000 } })
  @Get('liste_code_postaux/:code')
  @ApiOkResponse({ type: String })
  async liste_code_postaux(@Param('code') code_input: string): Promise<string> {
    const result = await this.code_postal_synthese(code_input);
    return result.liste_codes_postaux_dans_EPCI.join(',');
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 1000 } })
  @Get('code_postal_synthese_v2/:code')
  @ApiQuery({
    name: 'rayon',
    type: Number,
    required: false,
    description: `rayon en mètres de recherche, 3000 metres par défaut`,
  })
  @ApiOkResponse({ type: SyntheseAPI })
  async code_postal_synthese(
    @Param('code') code_input: string,
  ): Promise<SyntheseAPI> {
    const liste_aides = await this.aideRepository.listAll();
    const liste_articles = await this.articleRepository.searchArticles({});

    const IS_CODE_EPCI = this.communeRepository.isCodeSirenEPCI(code_input);

    let code_region_cible;
    let code_departement_cible;
    let code_commune_cible_ou_exemple;
    let nom_commune_ou_EPCI;
    let liste_codes_communes_of_input: string[];
    let liste_noms_communes_of_input: string[];
    let liste_codes_postaux_communes_of_input: Set<string> = new Set();

    if (IS_CODE_EPCI) {
      const EPCI = this.communeRepository.getEPCIBySIRENCode(code_input);
      liste_noms_communes_of_input = EPCI.membres.map((m) => m.nom);
      for (const membre of EPCI.membres) {
        this.communeRepository
          .getCodePostauxFromCodeCommune(membre.code)
          .forEach((c) => liste_codes_postaux_communes_of_input.add(c));
      }

      liste_codes_communes_of_input =
        this.communeRepository.getListeCodesCommuneParCodeEPCI(code_input);

      code_commune_cible_ou_exemple = liste_codes_communes_of_input[0];
      nom_commune_ou_EPCI = EPCI.nom;
    } else {
      liste_codes_communes_of_input = [code_input];
      code_commune_cible_ou_exemple = code_input;
      const commune_cible =
        this.communeRepository.getCommuneByCodeINSEESansArrondissement(
          code_input,
        );
      if (!commune_cible) {
        ApplicationError.throwSirenOuCodeInseeNotFound(code_input);
      }
      commune_cible.codesPostaux.forEach((c) =>
        liste_codes_postaux_communes_of_input.add(c),
      );

      nom_commune_ou_EPCI = commune_cible.nom;
      liste_noms_communes_of_input = [];
    }

    let total_users = await this.userRepository.nombreTotalUtilisateurs();
    let local_users = await this.userRepository.findUserIdsByCodesCommune(
      liste_codes_communes_of_input,
    );

    const region_departement =
      CommuneRepository.findDepartementRegionByCodeCommune(
        code_commune_cible_ou_exemple,
      );
    code_departement_cible = region_departement?.code_departement;
    code_region_cible = region_departement?.code_region;

    const categorisation_aides = this.rangeContenuParLocalisation(
      liste_aides,
      code_region_cible,
      code_departement_cible,
      IS_CODE_EPCI,
      code_input,
      liste_codes_communes_of_input,
      true,
    );

    const categorisation_articles = this.rangeContenuParLocalisation(
      liste_articles,
      code_region_cible,
      code_departement_cible,
      IS_CODE_EPCI,
      code_input,
      liste_codes_communes_of_input,
      false,
    );

    let nombre_points_moyen = 0;
    let nombre_inscrit_dernier_mois = 0;
    let nombre_actifs_locaux = 0;

    const last_month = new Date();
    last_month.setMonth(new Date().getMonth() - 1);

    const epoc_last_month = last_month.getTime();

    for (const userid of local_users) {
      const user = await this.userRepository.getById(userid, [
        Scope.gamification,
      ]);
      nombre_points_moyen += user.gamification.getPoints();
      if (user.created_at.getTime() > epoc_last_month) {
        nombre_inscrit_dernier_mois++;
      }
      if (
        user.derniere_activite &&
        user.derniere_activite.getTime() > epoc_last_month
      ) {
        nombre_actifs_locaux++;
      }
    }

    let nbr_actions_logement = 0;
    let nbr_actions_alimentation = 0;
    let nbr_actions_transport = 0;
    let nbr_actions_consommation = 0;

    for (const action of this.actionRepository.getActionCompleteList()) {
      switch (action.thematique) {
        case Thematique.alimentation:
          nbr_actions_alimentation++;
          break;
        case Thematique.logement:
          nbr_actions_logement++;
          break;
        case Thematique.transport:
          nbr_actions_transport++;
          break;
        case Thematique.consommation:
          nbr_actions_consommation++;
          break;
      }
    }

    const nbr_actions_total =
      nbr_actions_logement +
      nbr_actions_alimentation +
      nbr_actions_consommation +
      nbr_actions_transport;

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
    result.liste_codes_postaux_dans_EPCI = Array.from(
      liste_codes_postaux_communes_of_input.values(),
    );
    result.nombre_inscrits_total = total_users;
    result.nombre_inscrits_local = local_users.length;
    result.nombre_actifs_local_dernier_mois = nombre_actifs_locaux;
    result.nombre_inscrits_local_dernier_mois = nombre_inscrit_dernier_mois;
    result.nombre_inscrits_total_dernier_mois =
      await this.statistiqueExternalRepository.getNombreInscritsDernierMois();
    result.nombre_points_moyen =
      local_users.length > 0 ? nombre_points_moyen / local_users.length : 0;

    result.pourcent_actions_alimentation = this.pourcent(
      nbr_actions_alimentation,
      nbr_actions_total,
    );
    result.pourcent_actions_logement = this.pourcent(
      nbr_actions_logement,
      nbr_actions_total,
    );
    result.pourcent_actions_transport = this.pourcent(
      nbr_actions_transport,
      nbr_actions_total,
    );
    result.pourcent_actions_consommation = this.pourcent(
      nbr_actions_consommation,
      nbr_actions_total,
    );

    result.liste_aides_region = categorisation_aides.regional;
    result.liste_aides_departement = categorisation_aides.departemental;
    result.liste_aides_locales = categorisation_aides.local;
    result.liste_aides_nationales = categorisation_aides.national;

    result.liste_articles_region = categorisation_articles.regional;
    result.liste_articles_departement = categorisation_articles.departemental;
    result.liste_articles_locales = categorisation_articles.local;

    return result;
  }

  private rangeContenuParLocalisation(
    liste_contenu: ContenuLocal[],
    code_region_cible: string,
    code_departement_cible: string,
    IS_CODE_EPCI: boolean,
    code_insee_input: string,
    liste_codes_communes_of_input: string[],
    is_aides: boolean,
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
        content_def.include_codes_commune.length === 0 &&
        content_def.codes_commune_from_partenaire.length === 0 &&
        content_def.codes_departement_from_partenaire.length === 0 &&
        content_def.codes_region_from_partenaire.length === 0
      ) {
        result.national.push(ContentAPI.mapContent(content_def));
        continue;
      }
      if (content_def.codes_region.includes(code_region_cible)) {
        result.regional.push(ContentAPI.mapContent(content_def));
      }
      if (
        content_def.codes_region_from_partenaire.includes(code_region_cible)
      ) {
        result.regional.push(ContentAPI.mapContent(content_def));
      }
      if (content_def.codes_departement.includes(code_departement_cible)) {
        result.departemental.push(ContentAPI.mapContent(content_def));
      }
      if (
        content_def.codes_departement_from_partenaire.includes(
          code_departement_cible,
        )
      ) {
        result.departemental.push(ContentAPI.mapContent(content_def));
      }
      if (is_aides) {
        for (const code_postal of content_def.codes_postaux) {
          const liste_codes_communes_of_code_postal =
            this.communeRepository.getListCodesCommunesParCodePostal(
              code_postal,
            );

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
            if (
              liste_codes_communes_of_code_postal.includes(code_insee_input)
            ) {
              RESULT_liste_locale.set(
                content_def.content_id,
                ContentAPI.mapContent(content_def),
              );
            }
          }
        }
      }
      if (content_def.include_codes_commune.includes(code_insee_input)) {
        RESULT_liste_locale.set(
          content_def.content_id,
          ContentAPI.mapContent(content_def),
        );
      }
      for (const code_commune of liste_codes_communes_of_input) {
        if (content_def.codes_commune_from_partenaire.includes(code_commune)) {
          RESULT_liste_locale.set(
            content_def.content_id,
            ContentAPI.mapContent(content_def),
          );
        }
      }
    }
    result.local = Array.from(RESULT_liste_locale.values());
    return result;
  }

  private pourcent(a: number, b: number): number {
    if (b === 0) return 0;
    return Math.round((a / b) * 100);
  }
}
