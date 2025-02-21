import { ThematiqueHistory_v0 } from '../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from './thematique';

export class ThematiqueHistory {
  private liste_personnalisations_done: Thematique[];

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_personnalisations_done = [];
    if (data) {
      Object.assign(this, data);
    }
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
