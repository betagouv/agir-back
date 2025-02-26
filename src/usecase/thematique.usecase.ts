import { Injectable } from '@nestjs/common';
import { Action } from '../domain/actions/action';
import { TypeCodeAction } from '../domain/actions/actionDefinition';
import { TypeAction } from '../domain/actions/typeAction';
import { DetailThematique } from '../domain/thematique/history/detailThematique';
import { Thematique } from '../domain/thematique/thematique';
import { ThematiqueSynthese } from '../domain/thematique/thematiqueSynthese';
import { Scope, Utilisateur } from '../domain/utilisateur/utilisateur';
import { ApplicationError } from '../infrastructure/applicationError';
import { ActionFilter } from '../infrastructure/repository/action.repository';
import { CommuneRepository } from '../infrastructure/repository/commune/commune.repository';
import { UtilisateurRepository } from '../infrastructure/repository/utilisateur/utilisateur.repository';
import { ActionUsecase } from './actions.usecase';
import { AidesUsecase } from './aides.usecase';
import { Enchainement } from './questionKYC.usecase';

const THEMATIQUE_ENCHAINEMENT_MAPPING: { [key in Thematique]?: Enchainement } =
  {
    alimentation: Enchainement.ENCHAINEMENT_KYC_personnalisation_alimentation,
    consommation: Enchainement.ENCHAINEMENT_KYC_personnalisation_consommation,
    logement: Enchainement.ENCHAINEMENT_KYC_personnalisation_logement,
    transport: Enchainement.ENCHAINEMENT_KYC_personnalisation_transport,
  };

@Injectable()
export class ThematiqueUsecase {
  constructor(
    private actionUsecase: ActionUsecase,
    private aidesUsecase: AidesUsecase,
    private communeRepository: CommuneRepository,
    private utilisateurRepository: UtilisateurRepository,
  ) {}

  public async getUtilisateurThematique(
    utilisateurId: string,
    thematique: Thematique,
  ): Promise<DetailThematique> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    const personnalisation_done =
      utilisateur.thematique_history.isPersonnalisationDone(thematique);

    const result = new DetailThematique();
    result.thematique = thematique;
    result.liste_actions = [];
    result.enchainement_questions_personnalisation =
      THEMATIQUE_ENCHAINEMENT_MAPPING[thematique];
    result.personnalisation_necessaire = !personnalisation_done;

    if (personnalisation_done) {
      await this.buildThematiquePostPersonnalisation(result, utilisateur);

      await this.utilisateurRepository.updateUtilisateurNoConcurency(
        utilisateur,
        [Scope.thematique_history],
      );
    }

    return result;
  }

  private async buildThematiquePostPersonnalisation(
    detail_a_remplir: DetailThematique,
    utilisateur: Utilisateur,
  ): Promise<void> {
    let actions: Action[];
    const thema = detail_a_remplir.thematique;
    const history = utilisateur.thematique_history;

    if (history.existeDesPropositions(thema)) {
      actions = await this.getActionEligiblesUtilisateur(utilisateur, {
        type_codes_inclus: history.getActionsProposees(thema),
      });
      for (const action_proposee of history.getActionsProposees(thema)) {
        detail_a_remplir.liste_actions.push(
          actions.find((a) => a.equals(action_proposee)),
        );
      }
    } else {
      actions = await this.getActionEligiblesUtilisateur(utilisateur, {
        thematique: thema,
        type_codes_exclus: history.getActionsExclues(thema),
      });
      detail_a_remplir.liste_actions = actions.slice(0, 6);
      history.setActionsProposees(thema, detail_a_remplir.liste_actions);
    }

    for (const action of actions) {
      action.deja_vue = utilisateur.thematique_history.isActionVue(
        action.getTypeCode(),
      );
    }
  }

  public async removeAction(
    utilisateurId: string,
    thema: Thematique,
    code_action: string,
    type_action: TypeAction,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);
    const type_code: TypeCodeAction = { type: type_action, code: code_action };
    const history = utilisateur.thematique_history;

    if (history.doesActionsProposeesInclude(thema, type_code)) {
      history.exclureAction(thema, type_code);

      const new_action_list = await this.getActionEligiblesUtilisateur(
        utilisateur,
        {
          thematique: thema,
          type_codes_exclus: history
            .getActionsProposees(thema)
            .concat(history.getActionsExclues(thema)),
        },
      );
      if (new_action_list.length === 0) {
        history.removeActionAndShift(thema, type_code);
      } else {
        const new_action = new_action_list[0];
        history.switchAction(thema, type_code, new_action.getTypeCode());
      }
    } else {
      history.exclureAction(thema, type_code);
    }

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async declarePersonnalisationOK(
    utilisateurId: string,
    thematique: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history, Scope.kyc],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.thematique_history.declarePersonnalisationDone(thematique);

    utilisateur.thematique_history.recomputeTagExcluant(
      utilisateur.kyc_history,
    );

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  public async resetPersonnalisation(
    utilisateurId: string,
    thematique: Thematique,
  ) {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [Scope.thematique_history],
    );
    Utilisateur.checkState(utilisateur);

    utilisateur.thematique_history.resetPersonnalisation(thematique);

    await this.utilisateurRepository.updateUtilisateurNoConcurency(
      utilisateur,
      [Scope.thematique_history],
    );
  }

  private async getActionEligiblesUtilisateur(
    utilisateur: Utilisateur,
    filtre: ActionFilter,
  ): Promise<Action[]> {
    const result: Action[] = [];

    const liste_actions = await this.actionUsecase.internal_get_user_actions(
      utilisateur,
      filtre,
    );

    const tag_excluants =
      utilisateur.thematique_history.getListeTagsExcluants();

    for (const action of liste_actions) {
      if (!this.hasIntersect(action.tags_excluants, tag_excluants)) {
        result.push(action);
      }
    }
    return result;
  }

  private hasIntersect(array_1: any[], array_2: any[]): boolean {
    return array_1.some((v) => array_2.indexOf(v) !== -1);
  }

  public async getUtilisateurListeThematiquesPrincipales(
    utilisateurId: string,
  ): Promise<{
    nom_commune: string;
    thematiques: ThematiqueSynthese[];
  }> {
    const utilisateur = await this.utilisateurRepository.getById(
      utilisateurId,
      [],
    );
    Utilisateur.checkState(utilisateur);

    return await this.buildSyntheseFromCodeCommune(utilisateur.code_commune);
  }

  public async getListeThematiquesPrincipales(
    code_commune?: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    return await this.buildSyntheseFromCodeCommune(code_commune);
  }

  private async buildSyntheseFromCodeCommune(
    code_commune: string,
  ): Promise<{ nom_commune: string; thematiques: ThematiqueSynthese[] }> {
    const result: { nom_commune: string; thematiques: ThematiqueSynthese[] } = {
      nom_commune: undefined,
      thematiques: [],
    };

    if (code_commune) {
      const commune =
        this.communeRepository.getCommuneByCodeINSEE(code_commune);
      if (!commune) {
        ApplicationError.throwCodeCommuneNotFound(code_commune);
      }
      result.nom_commune = commune.nom;
    }

    const alimentation: ThematiqueSynthese = {
      thematique: Thematique.alimentation,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.alimentation,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.alimentation,
        code_commune,
      ),
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
    };

    const logement: ThematiqueSynthese = {
      thematique: Thematique.logement,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.logement,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.logement,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const transport: ThematiqueSynthese = {
      thematique: Thematique.transport,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.transport,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.transport,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };
    const consommation: ThematiqueSynthese = {
      thematique: Thematique.consommation,
      nombre_actions: await this.actionUsecase.internal_count_actions(
        Thematique.consommation,
      ),
      nombre_aides: await this.aidesUsecase.internal_count_aides(
        Thematique.consommation,
        code_commune,
      ),
      nombre_recettes: undefined,
      nombre_simulateurs: 0,
    };

    result.thematiques.push(alimentation, logement, transport, consommation);

    return result;
  }
}
