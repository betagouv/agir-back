import { AideDefinition } from '../aides/aideDefinition';
import { ActionDefinition } from './actionDefinition';

export class Action extends ActionDefinition {
  aides: AideDefinition[];

  constructor(data: ActionDefinition) {
    super(data);
    this.aides = [];
  }
}
