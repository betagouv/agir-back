export class ThematiqueDefinition {
  id_cms: number;
  emoji: string;
  label: string;
  titre: string;
  code: string;
  image_url: string;

  constructor(data: ThematiqueDefinition) {
    Object.assign(this, data);
  }
}
