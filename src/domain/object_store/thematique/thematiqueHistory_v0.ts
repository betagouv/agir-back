import { TypeCodeAction } from '../../actions/actionDefinition';
import {
  ActionUtilisateur,
  Question,
  ThematiqueHistory,
} from '../../thematique/history/thematiqueHistory';
import {
  ActionExclue,
  ThematiqueRecommandation,
} from '../../thematique/history/thematiqueRecommandation';
import { Thematique } from '../../thematique/thematique';
import { Versioned_v0 } from '../versioned';

export class Question_v0 {
  date: Date;
  question: string;
  est_action_faite: boolean;

  static serialise(domain: Question): Question_v0 {
    return {
      date: domain.date,
      question: domain.question,
      est_action_faite: domain.est_action_faite,
    };
  }
}

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
  like_level: number;
  feedback: string;
  liste_questions: Question_v0[];
  liste_partages: Date[];

  static serialise(domain: ActionUtilisateur): ActionUtilisateur_v0 {
    return {
      action: domain.action,
      vue_le: domain.vue_le,
      faite_le: domain.faite_le,
      like_level: domain.like_level,
      feedback: domain.feedback,
      liste_questions: domain.liste_questions
        ? domain.liste_questions.map((q) => Question_v0.serialise(q))
        : [],
      liste_partages: domain.liste_partages,
    };
  }
}

export class ThematiqueRecommandation_v0 {
  thematique: Thematique;
  codes_actions_exclues: ActionExclue_v0[];
  personnalisation_done_once: boolean;
  first_personnalisation_date: Date;

  static serialise(
    domain: ThematiqueRecommandation,
  ): ThematiqueRecommandation_v0 {
    return {
      codes_actions_exclues: domain
        .getActionsExclues()
        .map((a) => ActionExclue_v0.serialise(a)),
      personnalisation_done_once: domain.isPersonnalisationDoneOnce(),
      thematique: domain.thematique,
      first_personnalisation_date: domain.getFirstPersonnalisationDate(),
    };
  }
}

export class ThematiqueHistory_v0 extends Versioned_v0 {
  liste_thematiques: ThematiqueRecommandation_v0[];
  liste_actions_utilisateur: ActionUtilisateur_v0[];
  codes_actions_exclues: ActionExclue_v0[];
  recommandations_winter: TypeCodeAction[];

  static serialise(domain: ThematiqueHistory): ThematiqueHistory_v0 {
    return {
      version: 0,
      liste_thematiques: domain
        .getListeThematiques()
        .map((t) => ThematiqueRecommandation_v0.serialise(t)),

      liste_actions_utilisateur: domain
        .getListeActionsUtilisateur()
        .map((a) => ActionUtilisateur_v0.serialise(a)),
      codes_actions_exclues: domain
        .getAllActionsExclues()
        .map((a) => ActionExclue_v0.serialise(a)),
      recommandations_winter: domain.getRecommandationsWinter(),
    };
  }
}
