import { Action } from '../../actions/action';
import { TypeCodeAction } from '../../actions/actionDefinition';
import { KYCHistory } from '../../kyc/kycHistory';
import { ThematiqueHistory_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { TagExcluant } from '../../scoring/tagExcluant';
import { Thematique } from '../thematique';
import { KycTagExcluantTranslator } from './kycTagTranslator';
import { ThematiqueRecommandation } from './thematiqueRecommandation';

export class ThematiqueHistory {
  private liste_thematiques: ThematiqueRecommandation[];
  private liste_actions_vues: TypeCodeAction[];
  private liste_tags_excluants: TagExcluant[];

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_thematiques = [];
    this.liste_actions_vues = [];
    this.liste_tags_excluants = [];
    if (data) {
      if (data.liste_thematiques) {
        this.liste_thematiques = data.liste_thematiques.map(
          (t) => new ThematiqueRecommandation(t.thematique, t),
        );
      }
      if (data.liste_actions_vues) {
        this.liste_actions_vues = data.liste_actions_vues;
      }
      if (data.liste_tags_excluants) {
        this.liste_tags_excluants = data.liste_tags_excluants;
      }
    }
  }

  public recomputeTagExcluant(history: KYCHistory) {
    const set = KycTagExcluantTranslator.extractTagsFromKycs(history);
    this.liste_tags_excluants = Array.from(set.values());
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
  public getListeTagsExcluants(): TagExcluant[] {
    return this.liste_tags_excluants;
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

  public getNombreActionProposees(thematique: Thematique): number {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getNombreActionProposees() : 0;
  }
  public existeDesPropositions(thematique: Thematique): boolean {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getNombreActionProposees() > 0 : false;
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

  public exclureAction(
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
