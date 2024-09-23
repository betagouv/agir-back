import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../../domain/contenu/contentType';
import { DifficultyLevel } from '../../../../domain/contenu/difficultyLevel';
import { Thematique } from '../../../../domain/contenu/thematique';
import { Todo, TodoElement } from '../../../../../src/domain/todo/todo';
import { CelebrationAPI } from '../gamification/gamificationAPI';
import { QuestionKYCAPI } from '../kyc/questionsKYCAPI';
import { MosaicKYCAPI } from '../kyc/mosaicKYCAPI';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class TodoElementAPI {
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques?: Thematique[];
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: ContentType }) type?: ContentType;
  @ApiProperty({ enum: DifficultyLevel }) level?: DifficultyLevel;
  @ApiProperty() content_id?: string;
  @ApiProperty() interaction_id?: string;
  @ApiProperty() url?: string;
  @ApiProperty() points: number;
  @ApiProperty() questions?: any[];
  @ApiProperty() sont_points_en_poche: boolean;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;

  public static mapToAPI(element: TodoElement): TodoElementAPI {
    return {
      id: element.id,
      titre: element.titre,
      type: element.type,
      level: element.level,
      content_id: element.content_id,
      interaction_id: element.interaction_id,
      url: element.url,
      points: element.points,
      questions: element.questions
        ? element.questions.map((q) => {
            if (q.kyc) {
              return QuestionKYCAPI.mapToAPI(q.kyc);
            } else {
              return MosaicKYCAPI.mapToAPI(q.mosaic);
            }
          })
        : undefined,
      progression: element.progression,
      sont_points_en_poche: element.sontPointsEnPoche(),
      thematiques: element.thematiques,
    };
  }
}

export class TodoAPI {
  @ApiProperty() numero_todo: number;
  @ApiProperty() points_todo: number;
  @ApiProperty() done_at: Date;
  @ApiProperty() titre: string;
  @ApiProperty() imageUrl: string;
  @ApiProperty() is_last: boolean;
  @ApiProperty({ type: CelebrationAPI }) celebration: CelebrationAPI;
  @ApiProperty({ type: [TodoElementAPI] }) todo: TodoElementAPI[];
  @ApiProperty({ type: [TodoElementAPI] }) done: TodoElementAPI[];

  public static mapTodoToTodoAPI(todo: Todo): TodoAPI {
    return {
      numero_todo: todo.numero_todo,
      points_todo: todo.points_todo,
      titre: todo.titre,
      imageUrl: todo.imageUrl,
      todo: todo.todo.map((e) => TodoElementAPI.mapToAPI(e)),
      done: todo.done.map((e) => TodoElementAPI.mapToAPI(e)),
      done_at: todo.done_at,
      is_last: todo.is_last ? todo.is_last : false,
      celebration: todo.celebration
        ? CelebrationAPI.mapToAPI(todo.celebration)
        : undefined,
    };
  }
}
