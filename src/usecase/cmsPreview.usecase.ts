import { Injectable } from '@nestjs/common';
import { Action, ActionService } from '../domain/actions/action';
import { TypeAction } from '../domain/actions/typeAction';
import { AideDefinition } from '../domain/aides/aideDefinition';
import { Echelle } from '../domain/aides/echelle';
import { ServiceRechercheID } from '../domain/bibliotheque_services/recherche/serviceRechercheID';
import { Article } from '../domain/contenu/article';
import { ApplicationError } from '../infrastructure/applicationError';
import { Personnalisator } from '../infrastructure/personnalisation/personnalisator';
import { AideRepository } from '../infrastructure/repository/aide.repository';
import { CompteurActionsRepository } from '../infrastructure/repository/compteurActions.repository';
import { FAQRepository } from '../infrastructure/repository/faq.repository';
import { CMSImportUsecase } from './cms.import.usecase';

@Injectable()
export class CmsPreviewUsecase {
  constructor(
    private aideRepository: AideRepository,
    private cMSImportUsecase: CMSImportUsecase,
    private fAQRepository: FAQRepository,
    private personnalisator: Personnalisator,
    private compteurActionsRepository: CompteurActionsRepository,
  ) {}

  async getActionPreview(
    content_id: string,
    type: TypeAction,
  ): Promise<{ data: object; action: Action }> {
    if (type !== TypeAction.classique) {
      ApplicationError.throwPreviewNotAvailable(content_id, type);
    }

    const action_def = await this.cMSImportUsecase.getActionClassiqueFromCMS(
      content_id,
    );

    if (!action_def) {
      ApplicationError.throwActionNotFoundById(content_id, type);
    }

    const action = new Action(action_def);

    const linked_aides = await this.aideRepository.search({
      besoins: action_def.besoins,
      echelle: Echelle.National,
      date_expiration: new Date(),
    });

    const liste_services: ActionService[] = [];
    if (action_def.recette_categorie) {
      liste_services.push({
        categorie: action_def.recette_categorie,
        recherche_service_id: ServiceRechercheID.recettes,
      });
    }
    if (action_def.lvo_action) {
      liste_services.push({
        categorie: action_def.lvo_action,
        recherche_service_id: ServiceRechercheID.longue_vie_objets,
      });
    }

    action.faq_liste = [];
    for (const faq_id of action_def.faq_ids) {
      action.faq_liste.push(this.fAQRepository.getFaqByCmsId(faq_id));
    }

    action.setListeAides(linked_aides);
    action.services = liste_services;

    const nbr_faites = this.compteurActionsRepository.getNombreFaites(action);
    action.nombre_actions_faites = nbr_faites;
    action.label_compteur = action.label_compteur.replace(
      '{NBR_ACTIONS}',
      '' + nbr_faites,
    );

    return { data: {}, action: action };
  }

  async getAidePreviewByIdCMS(
    cms_id: string,
  ): Promise<{ data: object; aide: AideDefinition }> {
    const aide_def = await this.cMSImportUsecase.getAideFromCMS(cms_id);

    if (!aide_def) {
      ApplicationError.throwAideNotFound(cms_id);
    }

    return { data: {}, aide: this.personnalisator.personnaliser(aide_def) };
  }

  public async getArticlePreviewByIdCMS(
    content_id: string,
  ): Promise<{ data: object; article: Article }> {
    const article_def = await this.cMSImportUsecase.getArticleFromCMS(
      content_id,
    );

    if (!article_def) {
      ApplicationError.throwArticleNotFound(content_id);
    }

    return {
      data: {},
      article: this.personnalisator.personnaliser(new Article(article_def)),
    };
  }
}
