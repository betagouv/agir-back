export type CodeAwareUtilisateur = {
  id: string;
  code: string;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;

  active_account: boolean;
};
