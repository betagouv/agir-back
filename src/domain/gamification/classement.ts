export class Classement {
  constructor(classement: Classement) {
    Object.assign(this, classement);
  }

  utilisateurId: string;
  points: number;
  pseudo: string;
  code_postal: string;
  commune: string;

  rank?: number;
  rank_commune?: number;
}
