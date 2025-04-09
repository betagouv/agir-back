import { Action } from '../../actions/action';
import {
  ActionDefinition,
  TypeCodeAction,
} from '../../actions/actionDefinition';
import { KYCHistory } from '../../kyc/kycHistory';
import { ThematiqueHistory_v0 } from '../../object_store/thematique/thematiqueHistory_v0';
import { TagExcluant } from '../../scoring/tagExcluant';
import { Thematique } from '../thematique';
import { KycTagExcluantTranslator } from './kycTagTranslator';
import {
  ActionExclue,
  ThematiqueRecommandation,
} from './thematiqueRecommandation';

export type ActionUtilisateur = {
  action: TypeCodeAction;
  vue_le: Date;
  faite_le: Date;
  like_level: number;
  feedback: string;
};
export class ThematiqueHistory {
  private liste_thematiques: ThematiqueRecommandation[];
  private liste_actions_utilisateur: ActionUtilisateur[];
  private liste_tags_excluants: TagExcluant[];

  constructor(data?: ThematiqueHistory_v0) {
    this.liste_thematiques = [];
    this.liste_actions_utilisateur = [];
    this.liste_tags_excluants = [];
    if (data) {
      if (data.liste_thematiques) {
        this.liste_thematiques = data.liste_thematiques.map(
          (t) => new ThematiqueRecommandation(t.thematique, t),
        );
      }
      if (data.liste_actions_utilisateur) {
        this.liste_actions_utilisateur = data.liste_actions_utilisateur;
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
    const reco_existante =
      this.getOrCreateNewThematiqueRecommandation(thematique);
    reco_existante.setPersonnalisationDone();
  }

  public getOrCreateNewThematiqueRecommandation(
    thematique: Thematique,
  ): ThematiqueRecommandation {
    const reco_existante = this.getRecommandationByThematique(thematique);
    if (reco_existante) {
      return reco_existante;
    }
    const new_reco = new ThematiqueRecommandation(thematique);
    this.liste_thematiques.push(new_reco);
    return new_reco;
  }

  public reset() {
    this.liste_thematiques = [];
    this.liste_actions_utilisateur = [];
    this.liste_tags_excluants = [];
  }

  public resetPersonnalisation(thematique: Thematique) {
    const reco_existante =
      this.getOrCreateNewThematiqueRecommandation(thematique);
    reco_existante.resetPersonnalisation();
  }

  public isPersonnalisationDone(thematique: Thematique): boolean {
    const reco_existante = this.getRecommandationByThematique(thematique);
    return !!reco_existante && reco_existante.isPersonnalisationDone();
  }
  public isPersonnalisationDoneOnce(thematique: Thematique): boolean {
    const reco_existante = this.getRecommandationByThematique(thematique);
    return !!reco_existante && reco_existante.isPersonnalisationDoneOnce();
  }

  public getDatePremierePersonnalisation(thematique: Thematique): Date {
    const reco_existante = this.getRecommandationByThematique(thematique);
    return reco_existante?.getFirstPersonnalisationDate();
  }

  public getListeThematiques(): ThematiqueRecommandation[] {
    return this.liste_thematiques;
  }
  public getListeTagsExcluants(): TagExcluant[] {
    return this.liste_tags_excluants;
  }
  public getListeActionsUtilisateur(): ActionUtilisateur[] {
    return this.liste_actions_utilisateur;
  }
  public getListeActionsVues(): TypeCodeAction[] {
    return this.liste_actions_utilisateur
      .filter((a) => !!a.vue_le)
      .map((a) => a.action);
  }
  public getListeActionsFaites(): TypeCodeAction[] {
    return this.liste_actions_utilisateur
      .filter((a) => !!a.faite_le)
      .map((a) => a.action);
  }
  public isActionVue(action: TypeCodeAction): boolean {
    const found = this.findAction(action);
    return found ? !!found.vue_le : false;
  }

  public isActionFaite(action: TypeCodeAction): boolean {
    const found = this.findAction(action);
    return found ? !!found.faite_le : false;
  }

  public getLikeLevel(action: TypeCodeAction): number {
    const found = this.findAction(action);
    return found ? found.like_level : null;
  }

  public findAction(action: TypeCodeAction): ActionUtilisateur {
    return this.liste_actions_utilisateur.find(
      (a) => a.action.code === action.code && a.action.type === action.type,
    );
  }

  public getNombreActionsFaites(): number {
    return this.getListeActionsFaites().length;
  }

  public setActionCommeVue(action: TypeCodeAction) {
    const found = this.findAction(action);
    if (found) {
      found.vue_le = new Date();
    } else {
      this.liste_actions_utilisateur.push({
        action: ActionDefinition.extractTypeCodeFrom(action),
        vue_le: new Date(),
        faite_le: null,
        like_level: null,
        feedback: null,
      });
    }
  }
  public setActionCommeFaite(action: TypeCodeAction) {
    const found = this.findAction(action);
    if (found) {
      found.faite_le = new Date();
    } else {
      this.liste_actions_utilisateur.push({
        action: action,
        vue_le: null,
        faite_le: new Date(),
        like_level: null,
        feedback: null,
      });
    }
  }
  public setActionFeedback(
    action: TypeCodeAction,
    like_level: number,
    feedback: string,
  ) {
    const found = this.findAction(action);
    if (found) {
      found.like_level = like_level;
      found.feedback = feedback;
    } else {
      this.liste_actions_utilisateur.push({
        action: ActionDefinition.extractTypeCodeFrom(action),
        vue_le: null,
        faite_le: null,
        like_level: like_level ? like_level : null,
        feedback: feedback ? feedback : null,
      });
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
    const reco = this.getOrCreateNewThematiqueRecommandation(thematique);
    reco.setPersonnalisationDone();
    reco.setActionsProposees(actions);
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
    return reco ? reco.getActionsExclues().map((a) => a.action) : [];
  }
  public getActionsExcluesEtDates(thematique: Thematique): ActionExclue[] {
    const reco = this.getRecommandationByThematique(thematique);
    return reco ? reco.getActionsExclues() : [];
  }

  public exclureAction(
    thematique: Thematique,
    type_code_action: TypeCodeAction,
  ) {
    const reco = this.getOrCreateNewThematiqueRecommandation(thematique);
    reco.setPersonnalisationDone();
    reco.addActionToExclusionList(type_code_action);
  }

  public removeActionAndShift(
    thematique: Thematique,
    type_code_action: TypeCodeAction,
  ) {
    const reco = this.getOrCreateNewThematiqueRecommandation(thematique);
    reco.removeActionAndShift(type_code_action);
  }
  public appendAction(
    thematique: Thematique,
    type_code_action: TypeCodeAction,
  ) {
    const reco = this.getOrCreateNewThematiqueRecommandation(thematique);
    reco.appendAction(type_code_action);
  }

  public switchAction(
    thematique: Thematique,
    type_code_old_action: TypeCodeAction,
    type_code_new_action: TypeCodeAction,
  ) {
    const reco = this.getOrCreateNewThematiqueRecommandation(thematique);
    reco.replaceAction(type_code_old_action, type_code_new_action);
  }
}
