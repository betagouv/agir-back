import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../../src/domain/thematique';
import { Todo } from '../../../../../src/domain/todo/todo';

export class ProgressionAPI {
  @ApiProperty() current: number;
  @ApiProperty() target: number;
}

export class TodoElementAPI {
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty() titre: string;
  @ApiProperty() type: string;
  @ApiProperty() content_id: string;
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
