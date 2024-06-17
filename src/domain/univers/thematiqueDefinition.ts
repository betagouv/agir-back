export class ThematiqueDefinition {
  id_cms: number;
  label: string;
  code: string;
  image_url: string;
  niveau: number;
  univers_parent: string;
  famille_id_cms: number;
  famille_ordre: number;

  constructor(data: ThematiqueDefinition) {
    Object.assign(this, data);
  }
}
