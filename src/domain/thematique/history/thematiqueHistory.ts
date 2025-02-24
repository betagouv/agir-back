import { Action } from '../../actions/action';
import { TypeCode } from '../../actions/actionDefinition';
import { ThematiqueHistory_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';
import { ThematiqueRecommandation } from './thematiqueRecommandation';

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
  public getActionsProposees(thematique: Thematique): TypeCode[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsProposees() : [];
  }

  public doesActionsProposeesInclude(
    thematique: Thematique,
    type_code: TypeCode,
  ): boolean {
    const reco = this.getRecommandationByThematique(thematique);
    if (!reco) {
      return false;
    }
    return reco.doesActionsProposeesInclude(type_code);
  }

  public getActionsExclues(thematique: Thematique): TypeCode[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsExclues() : [];
  }

  public addActionToExclusionList(
    thematique: Thematique,
    type_code_action: TypeCode,
  ) {
    const reco_existante = this.getRecommandationByThematique(thematique);

    if (reco_existante) {
      reco_existante.addActionToExclusionList(type_code_action);
    } else {
      const new_reco = new ThematiqueRecommandation(thematique);
      new_reco.setPersonnalisationDone();
      new_reco.addActionToExclusionList(type_code_action);
      this.liste_thematiques.push(new_reco);
    }
  }

  public removeActionAndShift(
    thematique: Thematique,
    type_code_action: TypeCode,
  ) {
    this.getRecommandationByThematique(thematique).removeActionAndShift(
      type_code_action,
    );
  }

  public switchAction(
    thematique: Thematique,
    type_code_old_action: TypeCode,
    type_code_new_action: TypeCode,
  ) {
    this.getRecommandationByThematique(thematique).replaceAction(
      type_code_old_action,
      type_code_new_action,
    );
  }
}
