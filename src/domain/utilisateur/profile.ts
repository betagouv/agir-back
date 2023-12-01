export type Profile = {
  nom?: string;
  prenom?: string;
  email?: string;
  code_postal?: string;
  commune?: string;
  revenu_fiscal?: number;
  parts?: number;
  abonnement_ter_loire?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
};
