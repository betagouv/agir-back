import { Thematique } from '../../thematique/thematique';
import { ThematiqueHistory } from '../../thematique/thematiqueHistory';
import { Versioned_v0 } from '../versioned';

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_personnalisations_done: Thematique[];
  codes_actions_proposees: string[];
  codes_actions_exclues: string[];
  no_more_suggestions: boolean;

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_personnalisations_done: domain.getListePersonnalisationsDone(),
      codes_actions_exclues: domain.getActionsExclues(),
      codes_actions_proposees: domain.getActionsProposees(),
      no_more_suggestions: domain.plusDeSuggestionsDispo(),
    };
  }
}
