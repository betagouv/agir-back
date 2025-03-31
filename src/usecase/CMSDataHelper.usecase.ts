import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';

export type SourceData = {
  id: number;
  libelle: string; //"Angers - Guide : Planter mon arbre",
  lien: string; //"https://www.angers.fr/fileadmin/user_upload/guide_planter_mon_arbre_angers.pdf"
};
export type ArticleData = {
  id: number; //1010;
  titre: string; //'Les espaces naturels sensibles du Rhône';
  sousTitre: string; //;
  contenu: string; //'<p>Depuis de nombreuses années, <strong>le Département du Rhône met en œuvre une politique partenariale de conservation et de valorisation des sites naturels repertoriés espaces naturels sensibles de son territoire</strong>.&nbsp;</p><p>Acquisitions, aménagements, préservation des ressources en eau et des continuités écologiques, actions pédagogiques sont autant de déclinaisons de la politique départementale des espaces naturels sensibles.&nbsp;</p><p>Découvrez les 45 sites inventoriés de votre département dans des <a href="https://www.rhone.fr/jcms/tl1_5570/fr/les-espaces-naturels-sensibles">fiches à télécharger ici </a>!</p>';
  source: string; //'https://www.rhone.fr/jcms/tl1_5570/fr/les-espaces-naturels-sensibles';
  codes_postaux: string; //'';
  duree: string; //'⏱️2 minutes';
  frequence: string; //'';
  points: number; //5;
  difficulty: number; //2;
  createdAt: string; //'2024-06-19T15:02:22.102Z';
  updatedAt: string; //'2024-10-17T10:30:52.846Z';
  publishedAt: string; //'2024-06-19T15:06:38.747Z';
  categorie: string; //'recommandation';
  mois: string; //'';
  include_codes_commune: string; //'';
  exclude_codes_commune: string; //'';
  codes_departement: string; //'69';
  codes_region: string; //'';
  echelle: string; //null;
  derniere_maj: string; //null;
  imageUrl: number; //110;
  partenaire: number; //8;
  quizzes: number[];
  thematiques: number[];
  rubriques: number[];
  thematique_gamification: number;
  sources: number[];
  tag_article: string;
  action_classiques: number[];
  action_quizzes: number[];
  createdBy: number;
  updatedBy: number;
};

export type ArticleAndSourceExport = {
  version: number;
  data: {
    'sources.source': Record<string, SourceData>;
    'api::article.article': Record<string, ArticleData>;
  };
};

@Injectable()
export class CMSDataHelperUsecase {
  constructor() {}

  public async injecterPartenaireUniqueDansMultiPartenaires(
    jsonFilePath: string,
  ) {
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

    // dump du résultat
    writeFileSync('output.json', JSON.stringify(data));
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
