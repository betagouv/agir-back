import { TypeCodeAction } from '../../actions/actionDefinition';
import { ThematiqueRecommandation_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';

export type ActionExclue = {
  action: TypeCodeAction;
  date: Date;
};

export class ThematiqueRecommandation {
  thematique: Thematique;
  private actions_exclues: ActionExclue[];
  private personnalisation_done_once: boolean;
  private first_personnalisation_date: Date;

  constructor(thematique: Thematique, data?: ThematiqueRecommandation_v0) {
    this.thematique = thematique;
    this.actions_exclues = [];
    this.personnalisation_done_once = false;
    if (data) {
      this.actions_exclues = data.codes_actions_exclues;
      this.personnalisation_done_once = !!data.personnalisation_done_once;
      this.first_personnalisation_date = data.first_personnalisation_date;
    }
  }

  public setPersonnalisationDoneOnce() {
    if (!this.personnalisation_done_once) {
      this.first_personnalisation_date = new Date();
    }
    this.personnalisation_done_once = true;
  }
  public resetPersonnalisation() {
    this.actions_exclues = [];
  }

  public getFirstPersonnalisationDate(): Date {
    return this.first_personnalisation_date;
  }
  public getActionsExclues(): ActionExclue[] {
    return this.actions_exclues;
  }

  public isPersonnalisationDoneOnce(): boolean {
    return this.personnalisation_done_once;
  }
}
