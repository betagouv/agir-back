export class UniversDefinition {
  id_cms: number;
  label: string;
  code: string;
  image_url: string;

  constructor(data: UniversDefinition) {
    Object.assign(this, data);
  }
}
