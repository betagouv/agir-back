export class TagDefinition {
  cms_id: string;
  tag: string;
  description: string;
  ponderation: number;
  boost: number;

  constructor(data: TagDefinition) {
    Object.assign(this, data);
  }
}
