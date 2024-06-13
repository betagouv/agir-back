import { Versioned } from '../versioned';
import { Thematique } from '../../contenu/thematique';
import { Tag } from '../../scoring/tag';
import { Defi, DefiStatus } from '../../../../src/domain/defis/defi';
import { DefiHistory } from '../../../../src/domain/defis/defiHistory';
import { Categorie } from '../../../../src/domain/contenu/categorie';
import { ConditionDefi } from '../../../../src/domain/defis/defiDefinition';

export class Defi_v0 {
  id: string;
  titre: string;
  sous_titre: string;
  astuces: string;
  pourquoi: string;
  points: number;
  thematique: Thematique;
  status: DefiStatus;
  tags: Tag[];
  date_acceptation: Date;
  universes: string[];
  accessible: boolean;
  motif: string;
  categorie: Categorie;
  mois: number[];
  conditions: ConditionDefi[][];

  static map(elem: Defi): Defi_v0 {
    return {
      id: elem.id,
      titre: elem.titre,
      points: elem.points,
      thematique: elem.thematique,
      tags: elem.tags,
      astuces: elem.astuces,
      pourquoi: elem.pourquoi,
      sous_titre: elem.sous_titre,
      status: elem.getStatus(),
      date_acceptation: elem.date_acceptation,
      universes: elem.universes,
      accessible: elem.accessible,
      motif: elem.motif,
      categorie: elem.categorie,
      mois: elem.mois ? elem.mois : [],
      conditions: elem.conditions ? elem.conditions : [],
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
