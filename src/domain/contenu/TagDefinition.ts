export class TagDefinition {
  cms_id: string;
  tag: string;
  description: string;
  label_explication: string;
  ponderation: number;
  boost: number;

  constructor(data: TagDefinition) {
    Object.assign(this, data);
  }
}
