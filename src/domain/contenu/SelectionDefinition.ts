export class SelectionDefinition {
  cms_id: string;
  code: string;
  description: string;

  constructor(data: SelectionDefinition) {
    Object.assign(this, data);
  }
}
