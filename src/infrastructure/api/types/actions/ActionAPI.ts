import { ApiProperty } from '@nestjs/swagger';
import { ActionDefinition } from '../../../../domain/actions/actionDefinition';
import { QuestionKYCAPI_v2 } from '../kyc/questionsKYCAPI_v2';
import { CategorieRecherche } from '../../../../domain/bibliotheque_services/recherche/categorieRecherche';
import { QuizzBibliothequeAPI } from '../contenu/quizzAPI';
import { TypeAction } from '../../../../domain/actions/typeAction';
import { Thematique } from '../../../../domain/contenu/thematique';
import { EchelleAide } from '../../../../domain/aides/echelle';
import { AideDefinition } from '../../../../domain/aides/aideDefinition';
import { PartenaireDefinition } from '../../../../domain/contenu/partenaireDefinition';
import { PartenaireRepository } from '../../../repository/partenaire.repository';
import { Action } from '../../../../domain/actions/action';

export class AideActionAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: EchelleAide }) echelle: EchelleAide;
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
      echelle: EchelleAide[aide.echelle],
    };
  }
}

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
  @ApiProperty({ type: [AideActionAPI] })
  aides: AideActionAPI[];

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
      lvo_action: action.lvo_action,
      lvo_objet: action.lvo_objet,
      recette_categorie: action.recette_categorie,
      thematique: action.thematique,
      kycs: [],
      quizzes: [],
      aides: action.aides.map((a) => AideActionAPI.mapToAPI(a)),
    };
  }
}
