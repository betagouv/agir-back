import { TypeCode } from '../../actions/actionDefinition';
import { ThematiqueHistory } from '../../thematique/history/thematiqueHistory';
import { ThematiqueRecommandation } from '../../thematique/history/thematiqueRecommandation';
import { Thematique } from '../../thematique/thematique';
import { Versioned_v0 } from '../versioned';

export class ThematiqueRecommandation_v0 {
  thematique: Thematique;
  codes_actions_proposees: TypeCode[];
  codes_actions_exclues: TypeCode[];
  no_more_suggestions: boolean;
  personnalisation_done: boolean;

  static serialise(
    domain: ThematiqueRecommandation,
  ): ThematiqueRecommandation_v0 {
    return {
      codes_actions_exclues: domain.getActionsExclues(),
      codes_actions_proposees: domain.getActionsProposees(),
      no_more_suggestions: domain.plusDeSuggestionsDispo(),
      personnalisation_done: domain.isPersonnalisationDone(),
      thematique: domain.thematique,
    };
  }
}

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_thematiques: ThematiqueRecommandation_v0[];

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_thematiques: domain
        .getListeThematiques()
        .map((t) => ThematiqueRecommandation_v0.serialise(t)),
    };
  }
}
