export type Profile = {
  nom?: string;
  prenom?: string;
  email?: string;
  code_postal?: string;
  commune?: string;
  revenu_fiscal?: number;
  parts?: number;
  passwordHash?: string;
  passwordSalt?: string;
};
