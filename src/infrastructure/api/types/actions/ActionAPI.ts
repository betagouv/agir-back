import { ApiProperty } from '@nestjs/swagger';
import { Action, ActionService } from '../../../../domain/actions/action';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { Besoin } from '../../../../domain/aides/besoin';
import { Echelle } from '../../../../domain/aides/echelle';
import {
  CategorieRecherche,
  SousCategorieRecherche,
} from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../../../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
import { FAQDefinition } from '../../../../domain/faq/FAQDefinition';
import { ExplicationScore } from '../../../../domain/scoring/system_v2/ExplicationScore';
import { Thematique } from '../../../../domain/thematique/thematique';
import { PartenaireRepository } from '../../../repository/partenaire.repository';
import { ArticleLightAPI } from '../contenu/articleLightAPI';
import { ExplicationRecoAPI } from '../contenu/explicationRecoAPI';
import { QuizzBibliothequeAPI } from '../contenu/quizzAPI';
import { QuestionKYCAPI_v2 } from '../kyc/questionsKYCAPI_v2';

export class ServiceActionAPI {
  @ApiProperty({ enum: ServiceRechercheID })
  recherche_service_id: ServiceRechercheID;

  @ApiProperty({ enum: CategorieRecherche })
  categorie: CategorieRecherche;

  @ApiProperty({ enum: CategorieRecherche })
  sous_categorie: SousCategorieRecherche;

  public static map(service: ActionService): ServiceActionAPI {
    return {
      categorie: service.categorie,
      sous_categorie: service.sous_categorie,
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
    if (aide.partenaires_supp_ids && aide.partenaires_supp_ids.length > 0) {
      partenaire = PartenaireRepository.getPartenaire(
        aide.partenaires_supp_ids[0],
      );
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
export class SourceActionAPI {
  @ApiProperty() label: string;
  @ApiProperty() url: string;
}

export class ActionAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() emoji: string;
  @ApiProperty() points: number;
  @ApiProperty() score_recommandation: number;
  @ApiProperty() consigne: string;
  @ApiProperty({ type: [SourceActionAPI] }) sources: SourceActionAPI[];
  @ApiProperty() label_compteur: string;
  @ApiProperty() deja_vue: boolean;
  @ApiProperty() deja_faite: boolean;
  @ApiProperty() like_level: number;
  @ApiProperty() quizz_felicitations: string;
  @ApiProperty() nom_commune: string;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_actions_faites: number;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ enum: Besoin, isArray: true }) besoins: Besoin[];
  @ApiProperty() comment: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({ type: [QuizzBibliothequeAPI] })
  quizzes: QuizzBibliothequeAPI[];
  @ApiProperty({ type: [ArticleLightAPI] })
  articles: ArticleLightAPI[];
  @ApiProperty({ type: [QuestionKYCAPI_v2] }) kycs: QuestionKYCAPI_v2[];

  @ApiProperty({ type: [ActionAideAPI] })
  aides: ActionAideAPI[];

  @ApiProperty({ type: [FAQActionAPI] })
  faqs: FAQActionAPI[];

  @ApiProperty({ type: [ServiceActionAPI] })
  services: ServiceActionAPI[];

  @ApiProperty() enchainement_id: string;

  @ApiProperty({ type: ExplicationRecoAPI })
  explications_recommandation: ExplicationRecoAPI;

  explications_recommandation_raw: ExplicationScore;

  public static mapToAPI(action: Action): ActionAPI {
    return {
      nombre_actions_en_cours: action.nombre_actions_faites,
      nombre_actions_faites: action.nombre_actions_faites,
      nombre_aides_disponibles: action.nombre_aides,
      code: action.code,
      titre: action.titre,
      sous_titre: action.sous_titre,
      consigne: action.consigne,
      label_compteur: action.label_compteur,
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
      deja_faite: action.deja_faite,
      faqs: action.faq_liste.map((f) => FAQActionAPI.mapToAPI(f)),
      points: action.getNombrePoints(),
      sources: action.sources,
      articles: action.article_liste.map((a) => ArticleLightAPI.mapToAPI(a)),
      like_level: action.like_level,
      enchainement_id: action.enchainement_id,
      explications_recommandation: ExplicationRecoAPI.mapToApi(
        action.explicationScore,
      ),
      explications_recommandation_raw: action.explicationScore,
      emoji: action.emoji,
      score_recommandation: action.pourcent_match,
    };
  }
}
