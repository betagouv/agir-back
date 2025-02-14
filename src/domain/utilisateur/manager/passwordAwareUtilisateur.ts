export type PasswordAwareUtilisateur = {
  id: string;
  passwordHash: string | null;
  passwordSalt: string | null;
  failed_login_count: number | null;
  prevent_login_before: Date | null;
  force_connexion: boolean;
};
