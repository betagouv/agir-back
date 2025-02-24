import { Action } from '../../actions/action';
import { TypeCodeAction } from '../../actions/actionDefinition';
import { ThematiqueHistory_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../thematique';
import { ThematiqueRecommandation } from './thematiqueRecommandation';

export class ThematiqueHistory {
  private liste_thematiques: ThematiqueRecommandation[];
  private liste_actions_vues: TypeCodeAction[];

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_thematiques = [];
    this.liste_actions_vues = [];
    if (data) {
      if (data.liste_thematiques) {
        this.liste_thematiques = data.liste_thematiques.map(
          (t) => new ThematiqueRecommandation(t.thematique, t),
        );
      }
      if (data.liste_actions_vues) {
        this.liste_actions_vues = data.liste_actions_vues;
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
  public getListeActionsVues(): TypeCodeAction[] {
    return this.liste_actions_vues;
  }
  public isActionVue(action: TypeCodeAction): boolean {
    return this.indexOfTypeCode(this.liste_actions_vues, action) !== -1;
  }

  public setActionCommeVue(action: TypeCodeAction) {
    if (this.indexOfTypeCode(this.liste_actions_vues, action) === -1) {
      this.liste_actions_vues.push(action);
    }
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
  public getActionsProposees(thematique: Thematique): TypeCodeAction[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsProposees() : [];
  }

  public doesActionsProposeesInclude(
    thematique: Thematique,
    type_code: TypeCodeAction,
  ): boolean {
    const reco = this.getRecommandationByThematique(thematique);
    if (!reco) {
      return false;
    }
    return reco.doesActionsProposeesInclude(type_code);
  }

  public getActionsExclues(thematique: Thematique): TypeCodeAction[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsExclues() : [];
  }

  public addActionToExclusionList(
    thematique: Thematique,
    type_code_action: TypeCodeAction,
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
    type_code_action: TypeCodeAction,
  ) {
    this.getRecommandationByThematique(thematique).removeActionAndShift(
      type_code_action,
    );
  }

  public switchAction(
    thematique: Thematique,
    type_code_old_action: TypeCodeAction,
    type_code_new_action: TypeCodeAction,
  ) {
    this.getRecommandationByThematique(thematique).replaceAction(
      type_code_old_action,
      type_code_new_action,
    );
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
