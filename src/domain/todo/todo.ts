export class TodoData {
  niveau: number;
}

export class Todo extends TodoData {
  constructor(data: TodoData) {
    super();
    Object.assign(this, data);
  }
}
