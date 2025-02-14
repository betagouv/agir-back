export class Classement {
  constructor(classement: Classement) {
    Object.assign(this, classement);
  }

  utilisateurId: string;
  points: number;
  prenom: string | null;
  code_postal: string;
  commune: string;

  rank: number | null;
  rank_commune: number | null;
}
