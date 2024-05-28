export enum Profil {
  collectivite = 'collectivite',
  entreprise = 'entreprise',
  citoyen = 'citoyen',
  journaliste = 'journaliste',
  association = 'association',
  autre = 'autre',
}

export class UtilisateurAttente {
  email: string;
  code_postal: string;
  code_profil: Profil;
}
