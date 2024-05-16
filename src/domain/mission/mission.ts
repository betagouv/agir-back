import { ContentType } from '../contenu/contentType';
import {
  Objectif_v0,
  Mission_v0,
} from '../object_store/mission/MissionsUtilisateur_v0';
import { ThematiqueUnivers } from '../univers/thematiqueUnivers';
import { Univers } from '../univers/univers';

export class Objectif {
  id: string;
  titre: string;
  content_id: string;
  progression: { current: number; target: number };
  is_locked: boolean;
  done_at: Date;
  type: ContentType;
  points: number;
  sont_points_en_poche: boolean;

  constructor(data: Objectif_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.type = data.type;
    this.content_id = data.content_id;
    this.points = data.points;
    this.sont_points_en_poche = !!data.sont_points_en_poche;
    this.progression = data.progression;
    this.is_locked = !!data.is_locked;
    this.done_at = data.done_at;
  }
  public isDone?() {
    return this.progression.current === this.progression.target;
  }
}

export class Mission {
  id: string;
  titre: string;
  done_at: Date;
  thematique_univers: ThematiqueUnivers;
  univers: Univers;
  objectifs: Objectif[];

  constructor(data: Mission_v0) {
    this.id = data.id;
    this.titre = data.titre;
    this.done_at = data.done_at;
    this.univers = data.univers;
    this.thematique_univers = data.thematique_univers;

    if (data.done_at) {
      this.done_at = new Date(data.done_at);
    }

    this.objectifs = [];
    if (data.objectifs) {
      data.objectifs.forEach((element) => {
        this.objectifs.push(new Objectif(element));
      });
    }
  }

  public isDone?(): boolean {
    return !!this.done_at;
  }

  public empocherPoints?(element: Objectif): number {
    element.sont_points_en_poche = true;
    return element.points;
  }
}
