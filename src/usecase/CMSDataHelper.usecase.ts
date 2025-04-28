import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';

export type SourceData = {
  id: number;
  libelle: string; //"Angers - Guide : Planter mon arbre",
  lien: string; //"https://www.angers.fr/fileadmin/user_upload/guide_planter_mon_arbre_angers.pdf"
};
export type ArticleData = {
  id: number; //1010;
  titre?: string; //'Les espaces naturels sensibles du Rhône';
  sousTitre?: string; //;
  contenu?: string; //'<p>Depuis de nombreuses années, <strong>le Département du Rhône met en œuvre une politique partenariale de conservation et de valorisation des sites naturels repertoriés espaces naturels sensibles de son territoire</strong>.&nbsp;</p><p>Acquisitions, aménagements, préservation des ressources en eau et des continuités écologiques, actions pédagogiques sont autant de déclinaisons de la politique départementale des espaces naturels sensibles.&nbsp;</p><p>Découvrez les 45 sites inventoriés de votre département dans des <a href="https://www.rhone.fr/jcms/tl1_5570/fr/les-espaces-naturels-sensibles">fiches à télécharger ici </a>!</p>';
  source?: string; //'https://www.rhone.fr/jcms/tl1_5570/fr/les-espaces-naturels-sensibles';
  codes_postaux?: string; //'';
  duree?: string; //'⏱️2 minutes';
  frequence?: string; //'';
  points?: number; //5;
  difficulty?: number; //2;
  createdAt?: string; //'2024-06-19T15:02:22.102Z';
  updatedAt?: string; //'2024-10-17T10:30:52.846Z';
  publishedAt?: string; //'2024-06-19T15:06:38.747Z';
  categorie?: string; //'recommandation';
  mois?: string; //'';
  include_codes_commune?: string; //'';
  exclude_codes_commune?: string; //'';
  codes_departement?: string; //'69';
  codes_region?: string; //'';
  echelle?: string; //null;
  derniere_maj?: string; //null;
  imageUrl?: number; //110;
  partenaire?: number; //8;
  quizzes?: number[];
  thematiques?: number[];
  rubriques?: number[];
  thematique_gamification?: number;
  sources?: number[];
  tag_article?: string;
  action_classiques?: number[];
  action_quizzes?: number[];
  createdBy?: number;
  updatedBy?: number;
};

export type PartenaireData = {
  id: number; //1,
  nom: string; //"ADEME",
  lien: string; //"https://agirpourlatransition.ademe.fr/particuliers/",
  createdAt: string; //"2023-09-14T11:13:54.062Z",
  updatedAt: string; //"2025-02-24T13:10:26.502Z",
  publishedAt: string; //"2023-09-14T11:13:57.352Z",
  echelle: string; //"National",
  code_epci: string; //null,
  code_commune: string; //null,
  logo: number; //null,
  articles: [];
  aides: [];
  aides_multi_part: [];
  createdBy: number; //null,
  updatedBy: number; //null
};

export type ActionData = {
  id: number; //5,
  titre: string; //"Préparer un plat avec **des ingrédients locaux**",
  code: string; //"action_plat_local",
  sous_titre: string; //"Où trouver des produits locaux ?",
  pourquoi: string; //"# Pourquoi c'est important ?\n\n**Consommer local et de saison** a une influence directe sur la réduction des transports tout en permettant de soutenir l'économie locale. Des systèmes de vente directe du producteur au consommateur, tels que les marchés paysans ou les AMAP (Associations pour le maintien d'une agriculture paysanne) se développent aussi et contribuent à renforcer les liens entre les consommateurs et les agriculteurs.\n\n![Guide_ADEME](https://res.cloudinary.com/dq023imd8/image/upload/t_media_lib_thumb/v1739883747/Capture_d_ecran_2025_02_18_140100_4bb340c086.png)\n\n[Pour tout savoir sur l'alimentation durable, cliquez ici.](https://librairie.ademe.fr/ged/9236/guide-alimentation-plus-durable.pdf)",
  comment: string; //"# Comment faire ?\n\nConnaissez-vous les spécialités et les aliments produits dans votre région ?\nCette semaine, nous vous proposons de **composer un plat en utilisant majoritairement des ingrédients locaux !** Vous pouvez vous inspirer de nos recettes de saison en adaptant les ingrédients.\n\n# Où trouver des ingrédients locaux ?\n\n**[Sur cette carte](https://jagis.beta.gouv.fr/thematique/me-nourrir/service/pres-de-chez-nous)**, vous pourrez trouver les producteurs locaux autour de vous.\n\nIl existe aussi de nombreux autres cartes en ligne pour trouver des produits en circuits courts, comme le site *Frais et local*, *Bienvenue à la ferme* ou encore *le réseau des AMAP*.",
  categorie_recettes: string; //"saison",
  action_lvo: null;
  objet_lvo: null;
  createdAt: string; //"2025-02-17T15:16:10.354Z",
  updatedAt: string; //"2025-03-31T16:46:11.557Z",
  publishedAt: string; //"2025-02-18T09:35:11.549Z",
  ngc_action_rule: null;
  consigne: string; //"Préparez un plat avec une majorité d'ingrédients locaux cette semaine",
  label_compteur: string; //"**{NBR_ACTIONS} plats préparés** par la communauté",
  categorie_pdcn: string; //null,
  thematique: number; //1,
  besoins: number[];
  tags_excluants: number[];
  faqs: number[];
  sources: [];
  articles: [];
  createdBy: number;
  updatedBy: number;
};

export type AideData = {
  id: number; //3,
  titre?: string; //"Acheter un vélo",
  description?: string; //"<h3><strong>Vous souhaitez acheter un vélo neuf ou d'occasion, qu'il soit électrique ou classique ? </strong></h3><p>Des aides locales existent !</p><p><strong>Bon à savoir :</strong> le vélo est un des moyens de transport les moins carbonés.</p><p>Il peut remplacer la voiture dans de nombreux cas et c'est bon pour la santé !</p><h3><strong>Types de vélo</strong></h3><ul><li><p>Mécanique / Électrique</p></li><li><p>Classique / Pliant / Cargo / Adapté pour les personnes à mobilité réduite</p></li></ul>",
  echelle?: string; //"National",
  url_source?: string; //"https://www.economie.gouv.fr/particuliers/prime-velo-electrique#",
  codes_postaux?: string; //null,
  is_simulation?: boolean; //true,
  url_detail_front?: string; //"/aides/velo",
  montantMaximum?: string; //"2000",
  createdAt?: string; //"2023-09-26T10:18:56.754Z",
  updatedAt?: string; //"2025-02-18T15:35:20.455Z",
  publishedAt?: string; //"2024-10-08T08:54:22.187Z",
  include_codes_commune?: string; //null,
  exclude_codes_commune?: string; //null,
  codes_departement?: string; //null,
  codes_region?: string; //null,
  url_demande?: string; //null,
  date_expiration?: string; //"2025-12-31",
  derniere_maj?: string; //"2025-02-18",
  est_gratuit?: boolean; //false,
  thematiques?: number[]; //[  6],
  rubriques?: number[]; //[    26  ],
  besoin?: number; //1,
  tags?: [];
  partenaire?: number; //58,
  partenaires: number[];
  createdBy?: number; //null,
  updatedBy?: number; //11
};

export type TagExcluant = { id: number; valeur: string };

export type Thematique = {
  id: number;
  titre: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  code: string;
  label: string;
  emoji: string;
  articles: null;
  quizzes: null;
  aides: null;
  quizzes_gamification: null;
  rubriques: null;
  articles_gamifications: null;
  services: null;
  defis: null;
  imageUrl: null;
  kycs: null;
  missions: null;
  action_classiques: null;
  action_bilans: null;
  action_quizzes: null;
  action_simulateurs: null;
  faqs: null;
  createdBy: null;
  updatedBy: null;
};

export type ArticleAndSourceExport = {
  version: number;
  data: {
    'sources.source': Record<string, SourceData>;
    'api::article.article': Record<string, ArticleData>;
  };
};
export type AideAndPartenaireExport = {
  version: number;
  data: {
    'api::partenaire.partenaire'?: Record<string, PartenaireData>;
    'api::aide.aide': Record<string, AideData>;
  };
};
export type ActionExport = {
  version: number;
  data: {
    'api::action-classique.action-classique'?: Record<string, ActionData>;
    'api::action-quizz.action-quizz'?: Record<string, ActionData>;
    'api::action-simulateur.action-simulateur'?: Record<string, ActionData>;
    'api::action-bilan.action-bilan'?: Record<string, ActionData>;
    'tags.tag-excluant'?: Record<string, TagExcluant>;
    'api::thematique.thematique'?: Record<string, Thematique>;
  };
};

@Injectable()
export class CMSDataHelperUsecase {
  constructor() {}

  public async migrateSourceVersListeSourcesSurArticles(jsonFilePath: string) {
    var data: ArticleAndSourceExport = JSON.parse(
      readFileSync(jsonFilePath, 'utf8'),
    );
    const liste_sources = data.data['sources.source'];
    const liste_articles = data.data['api::article.article'];

    let index_nouvelles_sources = 10000;
    const sources_a_ajouter: SourceData[] = [];

    for (const [article_id, article] of Object.entries(liste_articles)) {
      if (article.source) {
        const source_existante = this.findSourceOfLink(article.source, data);
        if (source_existante) {
          // rien à faire
          // on supprime la source
          console.log(
            `Article ${article_id} : Suppression source déjà existante dans liste sources cible : [${source_existante.id}][${source_existante.libelle}][${source_existante.lien}]`,
          );
          article.source = null;
        } else {
          // creation d'une nouvelle source si besoin
          let new_source = this.findSourceOfLinkInNewSources(
            article.source,
            sources_a_ajouter,
          );
          if (new_source) {
            // pas d'ajout de source
          } else {
            new_source = {
              id: index_nouvelles_sources++,
              libelle: article.source,
              lien: article.source,
            };
            sources_a_ajouter.push(new_source);
          }
          article.sources.push(new_source.id);
          console.log(
            `Article ${article_id} : Ajout nouvelle source  : [${new_source.id}][${new_source.lien}]`,
          );
        }
      }
    }
    // ajout des nouvelles sources créées
    for (const new_source of sources_a_ajouter) {
      data.data['sources.source']['' + new_source.id] = new_source;
    }

    const output: ArticleAndSourceExport = {
      version: data.version,
      data: {
        'sources.source': data.data['sources.source'],
        'api::article.article': {},
      },
    };
    for (const [article_id, article] of Object.entries(liste_articles)) {
      output.data['api::article.article']['' + article_id] = {
        id: parseInt(article_id),
        sources: article.sources,
      };
    }
    // dump du résultat
    writeFileSync('output.json', JSON.stringify(output));
  }

  public async migrateMultiPartenairesAides(jsonFilePath: string) {
    var data: AideAndPartenaireExport = JSON.parse(
      readFileSync(jsonFilePath, 'utf8'),
    );
    const liste_aides = data.data['api::aide.aide'];

    for (const [aide_id, aide] of Object.entries(liste_aides)) {
      if (aide.partenaire) {
        aide.partenaires = [aide.partenaire];
      }
    }

    const output: AideAndPartenaireExport = {
      version: data.version,
      data: {
        'api::aide.aide': {},
      },
    };
    for (const [aide_id, aide] of Object.entries(liste_aides)) {
      output.data['api::aide.aide']['' + aide_id] = {
        id: parseInt(aide_id),
        partenaires: aide.partenaires,
      };
    }
    // dump du résultat
    writeFileSync('output.json', JSON.stringify(output));
  }

  public async cleanActionExport(jsonFilePath: string) {
    var data: ActionExport = JSON.parse(readFileSync(jsonFilePath, 'utf8'));
    const liste_actions_classiques =
      data.data['api::action-classique.action-classique'];
    const liste_quizz = data.data['api::action-quizz.action-quizz'];
    const liste_simu = data.data['api::action-simulateur.action-simulateur'];
    const liste_bilan = data.data['api::action-bilan.action-bilan'];

    const tags_excluant = data.data['tags.tag-excluant'];
    const thematiques = data.data['api::thematique.thematique'];

    const output = [];
    if (liste_actions_classiques) {
      for (const [action_id, action] of Object.entries(
        liste_actions_classiques,
      )) {
        output.push({
          id: action_id,
          type: 'classique',
          titre: action.titre,
          est_brouillon: !action.publishedAt,
          tags_excluant: action.tags_excluants.map(
            (t) => tags_excluant['' + t]?.valeur,
          ),
          thematique: thematiques['' + action.thematique]?.code,
        });
      }
      writeFileSync('out_actions_classique.json', JSON.stringify(output));
    }

    if (liste_quizz) {
      for (const [action_id, action] of Object.entries(liste_quizz)) {
        output.push({
          id: action_id,
          type: 'quizz',
          titre: action.titre,
          est_brouillon: !action.publishedAt,
          tags_excluant: action.tags_excluants.map(
            (t) => tags_excluant['' + t]?.valeur,
          ),
          thematique: thematiques['' + action.thematique]?.code,
        });
      }
      writeFileSync('out_actions_quizz.json', JSON.stringify(output));
    }

    if (liste_simu) {
      for (const [action_id, action] of Object.entries(liste_simu)) {
        output.push({
          id: action_id,
          type: 'simulateur',
          titre: action.titre,
          est_brouillon: !action.publishedAt,
          tags_excluant: action.tags_excluants.map(
            (t) => tags_excluant['' + t]?.valeur,
          ),
          thematique: thematiques['' + action.thematique]?.code,
        });
      }
      writeFileSync('out_actions_simulateur.json', JSON.stringify(output));
    }

    if (liste_bilan) {
      for (const [action_id, action] of Object.entries(liste_bilan)) {
        output.push({
          id: action_id,
          type: 'bilan',
          titre: action.titre,
          est_brouillon: !action.publishedAt,
          tags_excluant: action.tags_excluants.map(
            (t) => tags_excluant['' + t]?.valeur,
          ),
          thematique: thematiques['' + action.thematique]?.code,
        });
      }
      writeFileSync('out_actions_bilan.json', JSON.stringify(output));
    }
  }

  private findSourceOfLink(
    link: string,
    input: ArticleAndSourceExport,
  ): SourceData {
    for (const [source_id, source] of Object.entries(
      input.data['sources.source'],
    )) {
      if (source.lien === link) {
        return source;
      }
    }
    return null;
  }
  private findSourceOfLinkInNewSources(
    link: string,
    input: SourceData[],
  ): SourceData {
    for (const source of input) {
      if (source.lien === link) {
        return source;
      }
    }
    return null;
  }
}
