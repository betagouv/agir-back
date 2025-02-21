import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../domain/thematique/thematique';
import { Quizz } from '../../../../domain/contenu/quizz';
import {
  QuizzQuestion,
  QuizzReponse,
} from '../../../../domain/contenu/quizzDefinition';

export class QuizzReponseAPI {
  @ApiProperty() reponse: string;
  @ApiProperty() exact: boolean;

  static map(r: QuizzReponse): QuizzReponseAPI {
    return {
      exact: r.est_bonne_reponse,
      reponse: r.reponse,
    };
  }
}

export class QuizzQuestionAPI {
  @ApiProperty() libelle: string;
  @ApiProperty() explicationOk: string;
  @ApiProperty() explicationKO: string;
  @ApiProperty({ type: [QuizzReponseAPI] }) reponses: QuizzReponseAPI[];

  static map(question: QuizzQuestion): QuizzQuestionAPI {
    return {
      explicationKO: question.explication_ko,
      explicationOk: question.explication_ok,
      libelle: question.libelle,
      reponses: question.reponses.map((r) => QuizzReponseAPI.map(r)),
    };
  }
}
export class QuizzBibliothequeAPI {
  @ApiProperty() content_id: string;
  @ApiProperty() article_contenu: string;
  @ApiProperty() article_id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: Thematique }) thematique_principale: Thematique;
  @ApiProperty() duree: string;
  @ApiProperty() points: number;
  @ApiProperty() sousTitre: string;
  @ApiProperty() difficulty: number;
  @ApiProperty({ type: [QuizzQuestionAPI] }) questions: QuizzQuestionAPI[];

  static map(quizz: Quizz): QuizzBibliothequeAPI {
    return {
      content_id: quizz.content_id,
      article_contenu: quizz.article_contenu,
      article_id: quizz.article_id,
      difficulty: quizz.difficulty,
      duree: quizz.duree,
      points: quizz.points,
      sousTitre: quizz.soustitre,
      titre: quizz.titre,
      thematique_principale: quizz.thematique_principale,
      questions: quizz.questions.liste_questions.map((q) =>
        QuizzQuestionAPI.map(q),
      ),
    };
  }
}
