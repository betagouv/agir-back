import { ApiProperty } from '@nestjs/swagger';
import { Action, ActionService } from '../../../../domain/actions/action';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { Echelle } from '../../../../domain/aides/echelle';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { ServiceRechercheID } from '../../../../domain/bibliotheque_services/recherche/serviceRechercheID';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
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

export class AideActionAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: Echelle }) echelle: Echelle;
  @ApiProperty() montant_max: number;
  @ApiProperty() partenaire_nom: string;
  @ApiProperty() partenaire_url: string;
  @ApiProperty() partenaire_logo_url: string;

  public static mapToAPI(aide: AideDefinition): AideActionAPI {
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
    };
  }
}

export class ScoreActionAPI {
  score: number;
}

export class ActionAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
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

  @ApiProperty({ type: [AideActionAPI] })
  aides: AideActionAPI[];

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
      kycs: [],
      quizzes: action.quizz_liste.map((q) => QuizzBibliothequeAPI.map(q)),
      aides: action.getListeAides().map((a) => AideActionAPI.mapToAPI(a)),
      services: action.services.map((s) => ServiceActionAPI.map(s)),
      nom_commune: action.nom_commune,
      quizz_felicitations: action.quizz_felicitations,
    };
  }
}
