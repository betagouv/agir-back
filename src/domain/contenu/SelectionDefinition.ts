export class SelectionDefinition {
  cms_id: string;
  code: string;
  titre: string;
  description: string;
  image_url: string;

  constructor(data: SelectionDefinition) {
    Object.assign(this, data);
  }
}
