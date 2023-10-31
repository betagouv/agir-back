import { Injectable } from '@nestjs/common';
import { Todo } from '../../src/domain/todo/todo';
import { TodoRepository } from '../../src/infrastructure/repository/todo.repository';

@Injectable()
export class TodoUsecase {
  constructor(private todoRepository: TodoRepository) {}

  async getUtilisateurTodo(utilisateurId: string): Promise<Todo> {
    return this.todoRepository.getUtilisateurTodo(utilisateurId);
  }
}
