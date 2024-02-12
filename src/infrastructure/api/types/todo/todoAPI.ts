import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../../../../domain/contenu/contentType';
import { DifficultyLevel } from '../../../../domain/contenu/difficultyLevel';
import { Thematique } from '../../../../domain/contenu/thematique';
import { Todo } from '../../../../../src/domain/todo/todo';

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
  @ApiProperty() sont_points_en_poche: boolean;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;
}

export class TodoAPI {
  @ApiProperty() numero_todo: number;
  @ApiProperty() points_todo: number;
  @ApiProperty() done_at: Date;
  @ApiProperty() titre: string;
  @ApiProperty() is_last: boolean;
  @ApiProperty({ type: [TodoElementAPI] }) todo: TodoElementAPI[];
  @ApiProperty({ type: [TodoElementAPI] }) done: TodoElementAPI[];

  public static mapTodoToTodoAPI(todo: Todo): TodoAPI {
    return {
      numero_todo: todo.numero_todo,
      points_todo: todo.points_todo,
      titre: todo.titre,
      todo: todo.todo,
      done: todo.done,
      done_at: todo.done_at,
      is_last: todo.is_last ? todo.is_last : false,
    };
  }
}
