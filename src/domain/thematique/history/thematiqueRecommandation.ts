import { Action } from '../../actions/action';
import { TypeCode } from '../../actions/actionDefinition';
import { ThematiqueRecommandation_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';

export class ThematiqueRecommandation {
  thematique: Thematique;
  private actions_proposees: TypeCode[];
  private actions_exclues: TypeCode[];
  private no_more_suggestions: boolean;
  private personnalisation_done: boolean;

  constructor(thematique: Thematique, data?: ThematiqueRecommandation_v0) {
    this.thematique = thematique;
    this.actions_proposees = [];
    this.actions_exclues = [];
    this.no_more_suggestions = false;
    this.personnalisation_done = false;
    if (data) {
      this.actions_proposees = data.codes_actions_proposees;
      this.actions_exclues = data.codes_actions_exclues;
      this.no_more_suggestions = !!data.no_more_suggestions;
      this.personnalisation_done = !!data.personnalisation_done;
    }
  }

  public setPersonnalisationDone() {
    this.personnalisation_done = true;
  }
  public resetPersonnalisation() {
    this.personnalisation_done = false;
    this.actions_proposees = [];
  }

  public getActionsExclues(): TypeCode[] {
    return this.actions_exclues;
  }
  public getActionsProposees(): TypeCode[] {
    return this.actions_proposees;
  }
  public getNombreActionProposees(): number {
    return this.actions_proposees.length;
  }
  public plusDeSuggestionsDispo(): boolean {
    return this.no_more_suggestions;
  }

  public isPersonnalisationDone(): boolean {
    return this.personnalisation_done;
  }

  public replaceAction(old_action: TypeCode, new_action: TypeCode) {
    const position = this.indexOfTypeCode(this.actions_proposees, old_action);
    if (position >= 0) {
      this.actions_proposees[position] = new_action;
    }
  }

  public addActionToExclusionList(action: TypeCode) {
    if (!this.doesActionsExcluesInclude(action)) {
      this.actions_exclues.push(action);
    }
  }

  public setActionsProposees(actions: Action[]) {
    this.actions_proposees = actions.map((a) => ({
      code: a.code,
      type: a.type,
    }));
  }

  public removeActionAndShift(action: TypeCode) {
    const position = this.indexOfTypeCode(this.actions_proposees, action);
    if (position >= 0) {
      this.actions_proposees.splice(position, 1);
    }
    if (this.actions_proposees.length === 0) {
      this.no_more_suggestions = true;
    }
  }

  public extractActionsAProposer(actions: Action[]): Action[] {
    const result: Action[] = [];
    for (const action_cible of this.actions_proposees) {
      const target_action = actions.find(
        (a) => a.code === action_cible.code && a.type === action_cible.type,
      );
      if (target_action) {
        result.push(target_action);
      }
    }
    return result;
  }

  public doesActionsProposeesInclude(type_code: TypeCode): boolean {
    const index = this.indexOfTypeCode(this.actions_proposees, type_code);
    return index !== -1;
  }
  public doesActionsExcluesInclude(type_code: TypeCode): boolean {
    const index = this.indexOfTypeCode(this.actions_exclues, type_code);
    return index !== -1;
  }

  private indexOfTypeCode(array: TypeCode[], type_code: TypeCode): number {
    return array.findIndex(
      (a) => a.code === type_code.code && a.type === type_code.type,
    );
  }
}
