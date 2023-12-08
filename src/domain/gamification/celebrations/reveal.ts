import { v4 as uuidv4 } from 'uuid';

export enum RevealType {
  aides = 'aides',
  services = 'services',
}

export class Reveal {
  private static readonly TITRES_REVEAL: Record<RevealType, string> = {
    aides: "Découvrez le catalogue d'aides nationnales et locales !",
    services:
      "Un service permet d'avoir toujours sous les yeux vos fonctionnalités clés",
  };
  constructor(type: RevealType) {
    this.id = uuidv4();
    this.type = type;
    this.titre = Reveal.TITRES_REVEAL[type];
  }
  id: string;
  type: RevealType;
  titre: string;
}
