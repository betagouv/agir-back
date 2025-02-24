import { Action } from '../actions/action';
import { ThematiqueHistory_v0 } from '../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from './thematique';

export class ThematiqueHistory {
  private liste_personnalisations_done: Thematique[];
  private codes_actions_proposees: string[];
  private codes_actions_exclues: string[];
  private no_more_suggestions: boolean;

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_personnalisations_done = [];
    this.codes_actions_proposees = [];
    this.codes_actions_exclues = [];
    this.no_more_suggestions = false;
    if (data) {
      Object.assign(this, data);
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

  public declarePersonnalisationDone(thematique: Thematique) {
    if (!this.liste_personnalisations_done.includes(thematique)) {
      this.liste_personnalisations_done.push(thematique);
    }
  }

  public resetPersonnalisation(thematique: Thematique) {
    if (this.isPersonnalisationDone(thematique)) {
      this.liste_personnalisations_done.splice(
        this.liste_personnalisations_done.indexOf(thematique),
        1,
      );
    }
  }

  public isPersonnalisationDone(thematique: Thematique): boolean {
    return this.liste_personnalisations_done.includes(thematique);
  }

  public getListePersonnalisationsDone(): Thematique[] {
    return this.liste_personnalisations_done;
  }
}
