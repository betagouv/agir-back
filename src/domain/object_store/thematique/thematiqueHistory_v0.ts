import { TypeCodeAction } from '../../actions/actionDefinition';
import { TagExcluant } from '../../scoring/tagExcluant';
import {
  ActionUtilisateur,
  ThematiqueHistory,
} from '../../thematique/history/thematiqueHistory';
import {
  ActionExclue,
  ThematiqueRecommandation,
} from '../../thematique/history/thematiqueRecommandation';
import { Thematique } from '../../thematique/thematique';
import { Versioned_v0 } from '../versioned';

export class ActionExclue_v0 {
  action: TypeCodeAction;
  date: Date;

  static serialise(domain: ActionExclue): ActionExclue_v0 {
    return {
      action: domain.action,
      date: domain.date,
    };
  }
}

export class ActionUtilisateur_v0 {
  action: TypeCodeAction;
  vue_le: Date;
  faite_le: Date;

  static serialise(domain: ActionUtilisateur): ActionUtilisateur_v0 {
    return {
      action: domain.action,
      vue_le: domain.vue_le,
      faite_le: domain.faite_le,
    };
  }
}

export class ThematiqueRecommandation_v0 {
  thematique: Thematique;
  codes_actions_proposees: TypeCodeAction[];
  codes_actions_exclues: ActionExclue[];
  personnalisation_done: boolean;
  personnalisation_done_once: boolean;
  first_personnalisation_date: Date;

  static serialise(
    domain: ThematiqueRecommandation,
  ): ThematiqueRecommandation_v0 {
    return {
      codes_actions_exclues: domain
        .getActionsExclues()
        .map((a) => ActionExclue_v0.serialise(a)),
      codes_actions_proposees: domain.getActionsProposees(),
      personnalisation_done: domain.isPersonnalisationDone(),
      personnalisation_done_once: domain.isPersonnalisationDoneOnce(),
      thematique: domain.thematique,
      first_personnalisation_date: domain.getFirstPersonnalisationDate(),
    };
  }
}

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_thematiques: ThematiqueRecommandation_v0[];
  liste_actions_utilisateur: ActionUtilisateur[];
  liste_tags_excluants: TagExcluant[];

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_thematiques: domain
        .getListeThematiques()
        .map((t) => ThematiqueRecommandation_v0.serialise(t)),

      liste_actions_utilisateur: domain
        .getListeActionsUtilisateur()
        .map((a) => ActionUtilisateur_v0.serialise(a)),
      liste_tags_excluants: domain.getListeTagsExcluants(),
    };
  }
}
