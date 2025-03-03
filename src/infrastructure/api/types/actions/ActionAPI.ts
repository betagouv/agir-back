import { ApiProperty } from '@nestjs/swagger';
import { Action, ActionService } from '../../../../domain/actions/action';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { Echelle } from '../../../../domain/aides/echelle';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../../../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
import { FAQDefinition } from '../../../../domain/faq/FAQDefinition';
import { Thematique } from '../../../../domain/thematique/thematique';
import { PartenaireRepository } from '../../../repository/partenaire.repository';
import { QuizzBibliothequeAPI } from '../contenu/quizzAPI';
import { QuestionKYCAPI_v2 } from '../kyc/questionsKYCAPI_v2';

export class ServiceActionAPI {
  @ApiProperty({ enum: ServiceRechercheID })
  recherche_service_id: ServiceRechercheID;

  @ApiProperty({ enum: CategorieRecherche })
  categorie: CategorieRecherche;

  public static map(service: ActionService): ServiceActionAPI {
    return {
      categorie: service.categorie,
      recherche_service_id: service.recherche_service_id,
    };
  }
}

export class ActionAideAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: Echelle }) echelle: Echelle;
  @ApiProperty() montant_max: number;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;
  @ApiProperty() est_gratuit: boolean;

  public static mapToAPI(aide: AideDefinition): ActionAideAPI {
    let partenaire: PartenaireDefinition;
    if (aide.partenaire_id) {
      partenaire = PartenaireRepository.getPartenaire(aide.partenaire_id);
    }
    return {
      content_id: aide.content_id,
      titre: aide.titre,
      montant_max: aide.montant_max,
      partenaire_nom: partenaire ? partenaire.nom : null,
      partenaire_url: partenaire ? partenaire.url : null,
      partenaire_logo_url: partenaire ? partenaire.image_url : null,
      echelle: Echelle[aide.echelle],
      est_gratuit: aide.est_gratuit,
    };
  }
}

export class FAQActionAPI {
  @ApiProperty() question: string;
  @ApiProperty() reponse: string;

  public static mapToAPI(faq: FAQDefinition): FAQActionAPI {
    return {
      question: faq.question,
      reponse: faq.reponse,
    };
  }
}

export class ScoreActionAPI {
  @ApiProperty() nombre_bonnes_reponses: number;
  @ApiProperty() nombre_quizz_done: number;
}

export class ActionAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() deja_vue: boolean;
  @ApiProperty() quizz_felicitations: string;
  @ApiProperty() nom_commune: string;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ type: [String] }) besoins: string[];
  @ApiProperty() comment: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({ type: [QuizzBibliothequeAPI] })
  quizzes: QuizzBibliothequeAPI[];
  @ApiProperty({ type: [QuestionKYCAPI_v2] }) kycs: QuestionKYCAPI_v2[];

  @ApiProperty({ type: [ActionAideAPI] })
  aides: ActionAideAPI[];

  @ApiProperty({ type: [FAQActionAPI] })
  faqs: FAQActionAPI[];

  @ApiProperty({ type: [ServiceActionAPI] })
  services: ServiceActionAPI[];

  public static mapToAPI(action: Action): ActionAPI {
    return {
      nombre_actions_en_cours: Math.round(Math.random() * 1000),
      nombre_aides_disponibles: Math.round(Math.random() * 10),
      code: action.code,
      titre: action.titre,
      sous_titre: action.sous_titre,
      besoins: action.besoins,
      comment: action.comment,
      pourquoi: action.pourquoi,
      type: action.type,
      thematique: action.thematique,
      kycs: action.kycs?.map(QuestionKYCAPI_v2.mapToAPI) ?? [],
      quizzes: action.quizz_liste.map((q) => QuizzBibliothequeAPI.map(q)),
      aides: action.getListeAides().map((a) => ActionAideAPI.mapToAPI(a)),
      services: action.services.map((s) => ServiceActionAPI.map(s)),
      nom_commune: action.nom_commune,
      quizz_felicitations: action.quizz_felicitations,
      deja_vue: action.deja_vue,
      faqs: action.faq_liste.map((f) => FAQActionAPI.mapToAPI(f)),
    };
  }
}
