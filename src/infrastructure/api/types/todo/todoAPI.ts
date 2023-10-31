import { ApiProperty } from '@nestjs/swagger';
import { Todo } from 'src/domain/todo/todo';

export class TodoAPI {
  @ApiProperty() niveau: number;

  public static mapTodoToTodoAPI(todo: Todo): TodoAPI {
    return {
      niveau: todo.niveau,
    };
  }
}
