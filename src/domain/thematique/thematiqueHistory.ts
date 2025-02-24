import { Action } from '../actions/action';
import {
  ThematiqueHistory_v0,
  ThematiqueRecommandation_v0,
} from '../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from './thematique';

export class ThematiqueRecommandation {
  thematique: Thematique;
  private codes_actions_proposees: string[];
  private codes_actions_exclues: string[];
  private no_more_suggestions: boolean;
  private personnalisation_done: boolean;

  constructor(thematique: Thematique, data?: ThematiqueRecommandation_v0) {
    this.thematique = thematique;
    this.codes_actions_proposees = [];
    this.codes_actions_exclues = [];
    this.no_more_suggestions = false;
    this.personnalisation_done = false;
    if (data) {
      this.codes_actions_proposees = data.codes_actions_proposees;
      this.codes_actions_exclues = data.codes_actions_exclues;
      this.no_more_suggestions = !!data.no_more_suggestions;
      this.personnalisation_done = !!data.personnalisation_done;
    }
  }

  public setPersonnalisationDone() {
    this.personnalisation_done = true;
  }
  public resetPersonnalisation() {
    this.personnalisation_done = false;
    this.codes_actions_proposees = [];
  }

  public getActionsExclues(): string[] {
    return this.codes_actions_exclues;
  }
  public getActionsProposees(): string[] {
    return this.codes_actions_proposees;
  }
  public getNombreActionProposees(): number {
    return this.codes_actions_proposees.length;
  }
  public plusDeSuggestionsDispo(): boolean {
    return this.no_more_suggestions;
  }

  public isPersonnalisationDone(): boolean {
    return this.personnalisation_done;
  }

  public switchAction(code_old_action: string, code_new_action: string) {
    const position = this.codes_actions_proposees.indexOf(code_old_action);
    if (position >= 0) {
      this.codes_actions_proposees[position] = code_new_action;
    }
  }

  public addActionToExclusionList(code_action: string) {
    if (!this.codes_actions_exclues.includes(code_action)) {
      this.codes_actions_exclues.push(code_action);
    }
  }

  public setActionsProposees(actions: Action[]) {
    this.codes_actions_proposees = actions.map((a) => a.code);
  }

  public removeActionAndShift(code_action: string) {
    const position = this.codes_actions_proposees.indexOf(code_action);
    if (position >= 0) {
      this.codes_actions_proposees.splice(position, 1);
    }
    if (this.codes_actions_proposees.length === 0) {
      this.no_more_suggestions = true;
    }
  }

  public extractActionsAProposer(actions: Action[]): Action[] {
    const result: Action[] = [];
    for (const code_action_cible of this.codes_actions_proposees) {
      const target_action = actions.find((a) => a.code === code_action_cible);
      if (target_action) {
        result.push(target_action);
      }
    }
    return result;
  }
}

export class ThematiqueHistory {
  private liste_thematiques: ThematiqueRecommandation[];

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_thematiques = [];
    if (data) {
      if (data.liste_thematiques) {
        this.liste_thematiques = data.liste_thematiques.map(
          (t) => new ThematiqueRecommandation(t.thematique, t),
        );
      }
    }
  }

  public declarePersonnalisationDone(thematique: Thematique) {
    const reco_existante = this.getRecommandationByThematique(thematique);
    if (reco_existante) {
      reco_existante.setPersonnalisationDone();
    } else {
      const new_reco = new ThematiqueRecommandation(thematique);
      new_reco.setPersonnalisationDone();
      this.liste_thematiques.push(new_reco);
    }
  }

  public resetPersonnalisation(thematique: Thematique) {
    const reco_existante = this.getRecommandationByThematique(thematique);

    if (reco_existante) {
      reco_existante.resetPersonnalisation();
    } else {
      this.liste_thematiques.push(new ThematiqueRecommandation(thematique));
    }
  }

  public isPersonnalisationDone(thematique: Thematique): boolean {
    const reco_existante = this.getRecommandationByThematique(thematique);
    return !!reco_existante && reco_existante.isPersonnalisationDone();
  }

  public getListeThematiques(): ThematiqueRecommandation[] {
    return this.liste_thematiques;
  }

  public getRecommandationByThematique(
    thematique: Thematique,
  ): ThematiqueRecommandation {
    return this.liste_thematiques.find((t) => t.thematique === thematique);
  }

  public plusDeSuggestionsDispo(thematique: Thematique): boolean {
    return this.getRecommandationByThematique(
      thematique,
    )?.plusDeSuggestionsDispo();
  }

  public getNombreActionProposees(thematique: Thematique): number {
    return this.getRecommandationByThematique(
      thematique,
    )?.getNombreActionProposees();
  }

  public setActionsProposees(thematique: Thematique, actions: Action[]) {
    const reco_existante = this.getRecommandationByThematique(thematique);

    if (reco_existante) {
      reco_existante.setActionsProposees(actions);
    } else {
      const new_reco = new ThematiqueRecommandation(thematique);
      new_reco.setPersonnalisationDone();
      new_reco.setActionsProposees(actions);
      this.liste_thematiques.push(new_reco);
    }
  }

  public getActionsProposees(thematique: Thematique): string[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsProposees() : [];
  }

  public getActionsExclues(thematique: Thematique): string[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsExclues() : [];
  }

  public addActionToExclusionList(thematique: Thematique, code_action: string) {
    const reco_existante = this.getRecommandationByThematique(thematique);

    if (reco_existante) {
      reco_existante.addActionToExclusionList(code_action);
    } else {
      const new_reco = new ThematiqueRecommandation(thematique);
      new_reco.setPersonnalisationDone();
      new_reco.addActionToExclusionList(code_action);
      this.liste_thematiques.push(new_reco);
    }
  }

  public removeActionAndShift(thematique: Thematique, code_action: string) {
    this.getRecommandationByThematique(thematique).removeActionAndShift(
      code_action,
    );
  }

  public switchAction(
    thematique: Thematique,
    code_old_action: string,
    code_new_action: string,
  ) {
    this.getRecommandationByThematique(thematique).switchAction(
      code_old_action,
      code_new_action,
    );
  }
}
