import { ContentType } from '../contenu/contentType';

export class ObjectifDefinition {
  titre: string;
  content_id: string;
  type: ContentType;
  points: number;

  constructor(data: ObjectifDefinition) {
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
  }
}

export class MissionDefinition {
  id_cms: number;
  thematique_univers: string;
  objectifs: ObjectifDefinition[];
  prochaines_thematiques: string[];
  est_visible: boolean;
  univers: string;

  constructor(data: MissionDefinition) {
    this.thematique_univers = data.thematique_univers;
    this.est_visible = data.est_visible;
    this.id_cms = data.id_cms;
    this.univers = data.univers;

    this.prochaines_thematiques = [];
    if (data.prochaines_thematiques) {
      this.prochaines_thematiques = data.prochaines_thematiques;
    }

    this.objectifs = [];
    if (data.objectifs) {
      data.objectifs.forEach((element) => {
        this.objectifs.push(new ObjectifDefinition(element));
      });
    }
  }
}
