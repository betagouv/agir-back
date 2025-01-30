export type CodeAwareUtilisateur = {
  id: string;
  code: string | null;
  code_generation_time: Date | null;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;
  email: string;

  active_account: boolean;
};
