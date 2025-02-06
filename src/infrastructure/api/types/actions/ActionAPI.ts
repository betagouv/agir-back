import { ApiProperty } from '@nestjs/swagger';
import { ActionDefinition } from '../../../../domain/actions/actionDefinition';
import { QuestionKYCAPI_v2 } from '../kyc/questionsKYCAPI_v2';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { QuizzBibliothequeAPI } from '../contenu/quizzAPI';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { Thematique } from '../../../../domain/contenu/thematique';

export class ActionAPI {
  @ApiProperty() code: string;
  @ApiProperty() titre: string;
  @ApiProperty() sous_titre: string;
  @ApiProperty() nombre_actions_en_cours: number;
  @ApiProperty() nombre_aides_disponibles: number;
  @ApiProperty({ type: [String] }) besoins: string[];
  @ApiProperty() comment: string;
  @ApiProperty() pourquoi: string;
  @ApiProperty({ enum: CategorieRecherche }) lvo_action: CategorieRecherche;
  @ApiProperty() lvo_objet: string;
  @ApiProperty({ enum: CategorieRecherche })
  recette_categorie: CategorieRecherche;
  @ApiProperty({ enum: TypeAction }) type: TypeAction;
  @ApiProperty({ enum: Thematique }) thematique: Thematique;
  @ApiProperty({ type: [QuizzBibliothequeAPI] })
  quizzes: QuizzBibliothequeAPI[];
  @ApiProperty({ type: [QuestionKYCAPI_v2] }) kycs: QuestionKYCAPI_v2[];

  public static mapToAPI(action: ActionDefinition): ActionAPI {
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
      lvo_action: action.lvo_action,
      lvo_objet: action.lvo_objet,
      recette_categorie: action.recette_categorie,
      thematique: action.thematique,
      kycs: [],
      quizzes: [],
    };
  }
}
