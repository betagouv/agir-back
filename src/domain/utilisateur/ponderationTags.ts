export enum Tag {
  utilise_moto_ou_voiture = 'utilise_moto_ou_voiture',
  interet_transports = 'interet_transports',
}

export type PonderationTagSet = { [key in Tag]?: number };

export class PonderationTagHelper {
  static addTagToSet(set: PonderationTagSet, tag: Tag, value: number) {
    set[tag] = value;
  }
}
