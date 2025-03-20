import { Action } from '../../actions/action';
import { TypeCodeAction } from '../../actions/actionDefinition';
import { ThematiqueRecommandation_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';

export type ActionExclue = {
  action: TypeCodeAction;
  date: Date;
};

export class ThematiqueRecommandation {
  thematique: Thematique;
  private actions_proposees: TypeCodeAction[];
  private actions_exclues: ActionExclue[];
  private personnalisation_done: boolean;
  private personnalisation_done_once: boolean;
  private first_personnalisation_date: Date;

  constructor(thematique: Thematique, data?: ThematiqueRecommandation_v0) {
    this.thematique = thematique;
    this.actions_proposees = [];
    this.actions_exclues = [];
    this.personnalisation_done = false;
    this.personnalisation_done_once = false;
    if (data) {
      this.actions_proposees = data.codes_actions_proposees;
      this.actions_exclues = data.codes_actions_exclues;
      this.personnalisation_done = !!data.personnalisation_done;
      this.personnalisation_done_once = !!data.personnalisation_done_once;
      this.first_personnalisation_date = data.first_personnalisation_date;
    }
  }

  public setPersonnalisationDone() {
    this.personnalisation_done = true;
    if (!this.personnalisation_done_once) {
      this.first_personnalisation_date = new Date();
    }
    this.personnalisation_done_once = true;
  }
  public resetPersonnalisation() {
    this.personnalisation_done = false;
    this.actions_proposees = [];
    this.actions_exclues = [];
  }

  public getFirstPersonnalisationDate(): Date {
    return this.first_personnalisation_date;
  }
  public getActionsExclues(): ActionExclue[] {
    return this.actions_exclues;
  }
  public getActionsProposees(): TypeCodeAction[] {
    return this.actions_proposees;
  }
  public getNombreActionProposees(): number {
    return this.actions_proposees.length;
  }

  public isPersonnalisationDone(): boolean {
    return this.personnalisation_done;
  }
  public isPersonnalisationDoneOnce(): boolean {
    return this.personnalisation_done_once;
  }

  public replaceAction(old_action: TypeCodeAction, new_action: TypeCodeAction) {
    const position = this.indexOfTypeCode(this.actions_proposees, old_action);
    if (position >= 0) {
      this.actions_proposees[position] = {
        type: new_action.type,
        code: new_action.code,
      };
    }
  }

  public addActionToExclusionList(action: TypeCodeAction) {
    if (!this.doesActionsExcluesInclude(action)) {
      this.actions_exclues.push({
        action: { type: action.type, code: action.code },
        date: new Date(),
      });
    }
  }

  public setActionsProposees(actions: Action[]) {
    this.actions_proposees = actions.map((a) => ({
      code: a.code,
      type: a.type,
    }));
  }

  public removeActionAndShift(action: TypeCodeAction) {
    const position = this.indexOfTypeCode(this.actions_proposees, action);
    if (position >= 0) {
      this.actions_proposees.splice(position, 1);
    }
  }
  public appendAction(action: TypeCodeAction) {
    if (this.actions_proposees.length < 6) {
      this.actions_proposees.push({ type: action.type, code: action.code });
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

  public doesActionsProposeesInclude(type_code: TypeCodeAction): boolean {
    const index = this.indexOfTypeCode(this.actions_proposees, type_code);
    return index !== -1;
  }
  public doesActionsExcluesInclude(type_code: TypeCodeAction): boolean {
    const index = this.actions_exclues.findIndex(
      (a) =>
        a.action.code === type_code.code && a.action.type === type_code.type,
    );
    return index !== -1;
  }

  private indexOfTypeCode(
    array: TypeCodeAction[],
    type_code: TypeCodeAction,
  ): number {
    return array.findIndex(
      (a) => a.code === type_code.code && a.type === type_code.type,
    );
  }
}
