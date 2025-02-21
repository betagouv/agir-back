import { Versioned_v0 } from '../versioned';
import { ThematiqueHistory } from '../../thematique/thematiqueHistory';
import { Thematique } from '../../thematique/thematique';

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_personnalisations_done: Thematique[];

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_personnalisations_done: domain.getListePersonnalisationsDone(),
    };
  }
}
