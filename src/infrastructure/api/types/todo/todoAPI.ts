import { ApiProperty } from '@nestjs/swagger';
import { Thematique } from '../../../../../src/domain/thematique';
import { Todo } from '../../../../../src/domain/todo/todo';

export class TodoElementAPI {
  @ApiProperty({ enum: Thematique, enumName: 'Thematique', isArray: true })
  thematiques: Thematique[];
  @ApiProperty() titre: string;
  @ApiProperty() url: string;
  @ApiProperty() ordre: number;
  @ApiProperty() done: boolean;
}
export class TodoAPI {
  @ApiProperty() niveau: number;
  @ApiProperty({ type: [TodoElementAPI] }) elements: TodoElementAPI[];

  public static mapTodoToTodoAPI(todo: Todo): TodoAPI {
    return {
      niveau: todo.niveau,
      elements: todo.elements,
    };
  }
}
