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
