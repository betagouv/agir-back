import { Thematique } from '../thematique';
import { TodoElement } from './todoElement';

export class TodoData {
  niveau: number;
  elements: TodoElement[];
}

export class Todo extends TodoData {
  constructor(data: TodoData) {
    super();
    Object.assign(this, data);
  }

  public static buildTodoOfNiveau(niveau: number): Todo {
    switch (niveau) {
      case 1:
        return {
          niveau: 1,
          elements: [
            {
              ordre: 1,
              url: '/article/123',
              titre: 'lire un article',
              thematiques: [Thematique.climat],
              done: false,
            },
          ],
        };
      default:
        return Todo.buildTodoOfNiveau(1);
    }
  }
}
