import { TypeCodeAction } from '../../actions/actionDefinition';
import { TagExcluant } from '../../scoring/tagExcluant';
import { ThematiqueHistory } from '../../thematique/history/thematiqueHistory';
import { ThematiqueRecommandation } from '../../thematique/history/thematiqueRecommandation';
import { Thematique } from '../../thematique/thematique';
import { Versioned_v0 } from '../versioned';

export class ThematiqueRecommandation_v0 {
  thematique: Thematique;
  codes_actions_proposees: TypeCodeAction[];
  codes_actions_exclues: TypeCodeAction[];
  personnalisation_done: boolean;

  static serialise(
    domain: ThematiqueRecommandation,
  ): ThematiqueRecommandation_v0 {
    return {
      codes_actions_exclues: domain.getActionsExclues(),
      codes_actions_proposees: domain.getActionsProposees(),
      personnalisation_done: domain.isPersonnalisationDone(),
      thematique: domain.thematique,
    };
  }
}

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_thematiques: ThematiqueRecommandation_v0[];
  liste_actions_vues: TypeCodeAction[];
  liste_actions_faites: TypeCodeAction[];
  liste_tags_excluants: TagExcluant[];

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_thematiques: domain
        .getListeThematiques()
        .map((t) => ThematiqueRecommandation_v0.serialise(t)),

      liste_actions_vues: domain.getListeActionsVues(),
      liste_tags_excluants: domain.getListeTagsExcluants(),
      liste_actions_faites: domain.getListeActionsFaites(),
    };
  }
}
