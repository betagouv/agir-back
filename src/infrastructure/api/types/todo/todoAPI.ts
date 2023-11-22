import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '../../../../../src/domain/interaction/interactionType';
import { DifficultyLevel } from '../../../../../src/domain/difficultyLevel';
import { Thematique } from '../../../../../src/domain/thematique';
import { Todo } from '../../../../../src/domain/todo/todo';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class TodoElementAPI {
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty() id: string;
  @ApiProperty() titre: string;
  @ApiProperty({ enum: InteractionType }) type: InteractionType;
  @ApiProperty({ enum: DifficultyLevel }) level: DifficultyLevel;
  @ApiProperty() content_id?: string;
  @ApiProperty() interaction_id?: string;
  @ApiProperty() points: number;
  @ApiProperty() sont_points_en_poche: boolean;
  @ApiProperty({ type: ProgressionAPI }) progression: ProgressionAPI;
}

export class TodoAPI {
  @ApiProperty() numero_todo: number;
  @ApiProperty() points_todo: number;
  @ApiProperty({ type: [TodoElementAPI] }) todo: TodoElementAPI[];
  @ApiProperty({ type: [TodoElementAPI] }) done: TodoElementAPI[];

  public static mapTodoToTodoAPI(todo: Todo): TodoAPI {
    return {
      numero_todo: todo.numero_todo,
      points_todo: todo.points_todo,
      todo: todo.todo,
      done: todo.done,
    };
  }
}
