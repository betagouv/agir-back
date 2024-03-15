import { Versioned } from '../versioned';
import { Thematique } from '../../contenu/thematique';
import { Tag } from '../../scoring/tag';
import { Defi } from 'src/domain/defis/defi';
import { DefiHistory } from 'src/domain/defis/defiHistory';

export class Defi_v0 {
  id: string;
  titre: string;
  points: number;
  thematique?: Thematique;
  tags: Tag[];

  static map(elem: Defi): Defi_v0 {
    return {
      id: elem.id,
      titre: elem.titre,
      points: elem.points,
      thematique: elem.thematique,
      tags: elem.tags,
    };
  }
}

export class DefiHistory_v0 extends Versioned {
  defis: Defi_v0[];

  static serialise(domain: DefiHistory): DefiHistory_v0 {
    return {
      version: 0,
      defis: domain.defis.map((e) => Defi_v0.map(e)),
    };
  }
}
