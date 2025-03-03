export class BlockTextDefinition {
  cms_id: string;
  code: string;
  titre: string;
  texte: string;

  constructor(data: BlockTextDefinition) {
    Object.assign(this, data);
  }
}
