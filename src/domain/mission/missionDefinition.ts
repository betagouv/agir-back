import { ContentType } from '../contenu/contentType';

export class ObjectifDefinition {
  titre: string;
  content_id: string;
  id_cms: number;
  type: ContentType;
  points: number;
  tag_article: string;

  constructor(data: ObjectifDefinition) {
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
    this.tag_article = data.tag_article;
    this.id_cms = data.id_cms;
  }
}

export class MissionDefinition {
  id_cms: number;
  thematique_univers: string;
  objectifs: ObjectifDefinition[];
  est_visible: boolean;
  univers: string;

  constructor(data: MissionDefinition) {
    this.thematique_univers = data.thematique_univers;
    this.est_visible = data.est_visible;
    this.id_cms = data.id_cms;
    this.univers = data.univers;

    this.objectifs = [];
    if (data.objectifs) {
      data.objectifs.forEach((element) => {
        this.objectifs.push(new ObjectifDefinition(element));
      });
    }
  }

  public addIfNotContainsAlready?(objectif: ObjectifDefinition) {
    if (
      this.objectifs.findIndex(
        (o) => o.id_cms === objectif.id_cms && o.type === objectif.type,
      ) === -1
    ) {
      this.objectifs.push(objectif);
    }
  }
}
