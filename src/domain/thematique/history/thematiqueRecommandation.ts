import { TypeCodeAction } from '../../actions/actionDefinition';
import { ThematiqueRecommandation_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';

export type ActionExclue = {
  action: TypeCodeAction;
  date: Date;
};

export class ThematiqueRecommandation {
  thematique: Thematique;
  private personnalisation_done_once: boolean;
  private first_personnalisation_date: Date;

  constructor(thematique: Thematique, data?: ThematiqueRecommandation_v0) {
    this.thematique = thematique;
    this.personnalisation_done_once = false;
    if (data) {
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

  public getFirstPersonnalisationDate(): Date {
    return this.first_personnalisation_date;
  }

  public isPersonnalisationDoneOnce(): boolean {
    return this.personnalisation_done_once;
  }
}
