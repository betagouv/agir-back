export type PasswordAwareUtilisateur = {
  id: string;
  passwordHash: string;
  passwordSalt: string;
  failed_login_count: number;
  prevent_login_before: Date;
};
