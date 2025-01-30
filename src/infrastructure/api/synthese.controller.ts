import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  Response,
} from '@nestjs/common';
import { Response as Res } from 'express';
import {
  ApiBearerAuth,
  ApiExcludeController,
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
  @ApiProperty() nombre_inscrits: number;
  @ApiProperty() nombre_points_moyen: number;
  @ApiProperty() nombre_aides_total: number;
  @ApiProperty() nombre_aides_nat_total: number;
  @ApiProperty() nombre_aides_region_total: number;
  @ApiProperty() nombre_aides_departement_total: number;
  @ApiProperty() nombre_aides_commune_total: number;
  @ApiProperty() count_aide_alimentation: number;
  @ApiProperty() count_aide_consommation: number;
  @ApiProperty() count_aide_logement: number;
  @ApiProperty() count_aide_transport: number;
  @ApiProperty() count_aide_dechet: number;
  @ApiProperty() count_aide_loisir: number;
  @ApiProperty() result_LVO_all: number;
  @ApiProperty() result_LVO_donner: number;
  @ApiProperty() result_LVO_reparer: number;
  @ApiProperty() result_LVO_louer: number;
  @ApiProperty() result_LVO_emprunter: number;
  @ApiProperty() result_PDCN_circuit_court: number;
  @ApiProperty() result_PDCN_epicerie_superette: number;
  @ApiProperty() result_PDCN_marche_local: number;
  @ApiProperty() result_PDCN_zero_dechet: number;
  @ApiProperty() nombre_defis_encours: number;
  @ApiProperty() nombre_defis_realises: number;
  @ApiProperty() nombre_articles_locaux: number;
  @ApiProperty() nombre_articles_total: number;
  @ApiProperty({ type: [String] }) liste_communes: string[];
  @ApiProperty({ type: [ArticleLocalAPI] })
  liste_id_articles_locaux: ArticleLocalAPI[];
  @ApiProperty({ type: [AideLocalAPI] })
  liste_id_aides_locales: AideLocalAPI[];
}

@ApiTags('Previews')
@Controller()
@ApiBearerAuth()
export class SyntheseController extends GenericControler {
  constructor(
    private userRepository: UtilisateurRepository,
    private articleRepository: ArticleRepository,
    private communeRepository: CommuneRepository,
    private aideRepository: AideRepository,
    private rechercheServiceManager: RechercheServiceManager,
  ) {
    super();
  }

  @Get('code_postal_synthese/:code_postal')
  @ApiQuery({
    name: 'rayon',
    type: Number,
    required: false,
    description: `rayon en mettres de recherche, 3000 metres par défaut`,
  })
  @ApiOkResponse({ type: SyntheseAPI })
  async code_postal_synthese(
    //@Headers('Authorization') authorization: string,
    @Param('code_postal') code_postal: string,
    @Query('rayon') rayon: number,
    @Response() res: Res,
  ): Promise<any> {
    /*
    if (!this.checkAuthHeaderOK(authorization)) {
      return this.returnBadOreMissingLoginError(res);
    }
      */

    /*
    const liste_communes =
      this.communeRepository.getListCodesCommunesParCodePostal(code_postal);
    console.log(liste_communes);

    const epci = this.communeRepository.getEPCIByCommuneCodeINSEE(
      liste_communes[0],
    );

    const liste_code_commune_EPCI =
      this.communeRepository.getListeCodesCommuneParCodeEPCI(epci.code);

    const liste_code_postaux_EPCI = new Set<string>();
    for (const code_commune of liste_code_commune_EPCI) {
      const code_postaux =
        this.communeRepository.getCodePostauxFromCodeCommune(code_commune);
      for (const un_code_postal of code_postaux) {
        liste_code_postaux_EPCI.add(un_code_postal);
      }
    }
      */

    if (!rayon) {
      rayon = 3000;
    } else {
      rayon = parseInt('' + rayon);
    }

    const user_ids_code_postal = await this.userRepository.listUtilisateurIds({
      code_postal: code_postal,
    });

    /*
    let epci_users = [];
    for (const user_code_postal of liste_code_postaux_EPCI) {
      const user_ids_code_postal_extended =
        await this.userRepository.listUtilisateurIds(
          undefined,
          undefined,
          undefined,
          user_code_postal,
        );  
      epci_users = epci_users.concat(user_ids_code_postal_extended);
    }

    console.log(epci_users.length);
    console.log(user_ids_code_postal.length);
    */

    let nombre_points_moyen = 0;
    let nombre_defis_encours = 0;
    let nombre_defis_realises = 0;

    for (const userid of user_ids_code_postal) {
      const user = await this.userRepository.getById(userid, [
        Scope.gamification,
        Scope.defis,
      ]);
      nombre_points_moyen += user.gamification.points;
      nombre_defis_encours += user.defi_history.getNombreDefisEnCours();
      nombre_defis_realises += user.defi_history.getNombreDefisRealises();
    }
    if (user_ids_code_postal.length > 0) {
      nombre_points_moyen = nombre_points_moyen / user_ids_code_postal.length;
    }

    const filtre: FiltreRecherche = {};

    filtre.code_postal = code_postal;
    const liste_commune =
      this.communeRepository.getListCommunesNamesParCodePostal(code_postal);

    filtre.commune = liste_commune[0];

    filtre.rayon_metres = rayon;

    filtre.nombre_max_resultats = 2000;

    const code_commune = await this.communeRepository.getCodeCommune(
      filtre.code_postal,
      filtre.commune,
    );

    const dept_region =
      await this.communeRepository.findDepartementRegionByCodePostal(
        code_postal,
      );

    const aides_dispo = await this.aideRepository.search({
      code_postal: code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    });

    let count_aide_nat = 0;
    let count_aide_region = 0;
    let count_aide_departement = 0;
    let count_aide_commune = 0;
    let count_aide_alimentation = 0;
    let count_aide_consommation = 0;
    let count_aide_logement = 0;
    let count_aide_transport = 0;
    let count_aide_dechet = 0;
    let count_aide_loisir = 0;

    const liste_aides_locales: AideDefinition[] = [];

    for (const aide of aides_dispo) {
      if (aide.thematiques.includes(Thematique.alimentation)) {
        count_aide_alimentation++;
      }
      if (aide.thematiques.includes(Thematique.consommation)) {
        count_aide_consommation++;
      }
      if (aide.thematiques.includes(Thematique.logement)) {
        count_aide_logement++;
      }
      if (aide.thematiques.includes(Thematique.transport)) {
        count_aide_transport++;
      }
      if (aide.thematiques.includes(Thematique.loisir)) {
        count_aide_loisir++;
      }
      if (aide.thematiques.includes(Thematique.dechet)) {
        count_aide_dechet++;
      }

      if (
        aide.codes_postaux.length > 0 ||
        aide.include_codes_commune.length > 0
      ) {
        count_aide_commune++;
      }
      if (aide.codes_departement.length > 0) {
        count_aide_departement++;
      }
      if (aide.codes_region.length > 0) {
        count_aide_region++;
      }
      if (
        aide.codes_departement.length == 0 &&
        aide.codes_region.length === 0 &&
        aide.codes_postaux.length === 0 &&
        aide.include_codes_commune.length === 0
      ) {
        count_aide_nat++;
      } else {
        liste_aides_locales.push(aide);
      }
    }

    const finder_LVO = this.rechercheServiceManager.getFinderById(
      ServiceRechercheID.longue_vie_objets,
    );
    const finder_PDCN = this.rechercheServiceManager.getFinderById(
      ServiceRechercheID.proximite,
    );

    const result_LVO_donner = await finder_LVO.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.donner,
        nombre_max_resultats: 1,
      }),
    );
    const result_LVO_reparer = await finder_LVO.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.reparer,
        nombre_max_resultats: 1,
      }),
    );
    const result_LVO_louer = await finder_LVO.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.louer,
        nombre_max_resultats: 1,
      }),
    );
    const result_LVO_emprunter = await finder_LVO.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.emprunter,
        nombre_max_resultats: 1,
      }),
    );

    const result_LVO_all = await finder_LVO.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.vos_objets,
        nombre_max_resultats: 1,
      }),
    );

    const result_PDCN_circuit_court = await finder_PDCN.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.circuit_court,
      }),
    );
    const result_PDCN_epicerie_superette = await finder_PDCN.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.epicerie_superette,
      }),
    );
    const result_PDCN_marche_local = await finder_PDCN.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.marche_local,
      }),
    );
    const result_PDCN_zero_dechet = await finder_PDCN.find(
      new FiltreRecherche({
        ...filtre,
        categorie: CategorieRecherche.zero_dechet,
      }),
    );

    let nombre_articles_locaux = 0;
    const articles = await this.articleRepository.searchArticles({
      code_postal: code_postal,
      code_commune: code_commune ? code_commune : undefined,
      code_departement: dept_region ? dept_region.code_departement : undefined,
      code_region: dept_region ? dept_region.code_region : undefined,
    });

    const articles_locaux: ArticleDefinition[] = [];

    for (const article of articles) {
      if (
        article.codes_postaux.length > 0 ||
        article.codes_departement.length > 0 ||
        article.codes_region.length > 0
      ) {
        articles_locaux.push(article);
        nombre_articles_locaux++;
      }
    }

    // #####################################

    const result: SyntheseAPI = {
      liste_communes: liste_commune,
      nombre_inscrits: user_ids_code_postal.length,
      nombre_points_moyen: nombre_points_moyen,
      nombre_aides_total: aides_dispo.length,
      nombre_aides_nat_total: count_aide_nat,
      nombre_aides_region_total: count_aide_region,
      nombre_aides_departement_total: count_aide_departement,
      nombre_aides_commune_total: count_aide_commune,
      result_LVO_all:
        result_LVO_all.length > 0
          ? result_LVO_all[0].nbr_resultats_max_dispo
          : 0,
      result_LVO_donner:
        result_LVO_donner.length > 0
          ? result_LVO_donner[0].nbr_resultats_max_dispo
          : 0,
      result_LVO_reparer:
        result_LVO_reparer.length > 0
          ? result_LVO_reparer[0].nbr_resultats_max_dispo
          : 0,
      result_LVO_louer:
        result_LVO_louer.length > 0
          ? result_LVO_louer[0].nbr_resultats_max_dispo
          : 0,
      result_LVO_emprunter:
        result_LVO_emprunter.length > 0
          ? result_LVO_emprunter[0].nbr_resultats_max_dispo
          : 0,
      result_PDCN_circuit_court: result_PDCN_circuit_court.length,
      result_PDCN_epicerie_superette: result_PDCN_epicerie_superette.length,
      result_PDCN_marche_local: result_PDCN_marche_local.length,
      result_PDCN_zero_dechet: result_PDCN_zero_dechet.length,
      count_aide_alimentation: count_aide_alimentation,
      count_aide_consommation: count_aide_consommation,
      count_aide_logement: count_aide_logement,
      count_aide_transport: count_aide_transport,
      count_aide_dechet: count_aide_dechet,
      count_aide_loisir: count_aide_loisir,
      nombre_defis_encours: nombre_defis_encours,
      nombre_defis_realises: nombre_defis_realises,
      nombre_articles_locaux: nombre_articles_locaux,
      nombre_articles_total: articles.length,
      liste_id_articles_locaux: articles_locaux.map((a) => ({
        id: a.content_id,
        thematique: a.thematique_principale,
        titre: a.titre,
      })),
      liste_id_aides_locales: liste_aides_locales.map((a) => ({
        id: a.content_id,
        thematiques: a.thematiques,
        titre: a.titre,
      })),
    };
    return res.json(result);
  }

  private returnBadOreMissingLoginError(res: Res) {
    return res
      .set({ 'WWW-Authenticate': 'Basic realm=preview' })
      .status(401)
      .send('Bad or missing login / password');
  }
  private checkAuthHeaderOK(header: string): boolean {
    if (!header || !header.startsWith('Basic ')) {
      return false;
    }
    const base64 = header.split(' ').pop();
    return App.getBasicLoginPwdBase64() == base64;
  }
}
