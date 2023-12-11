export type CodeAwareUtilisateur = {
  id: string;
  code: string;
  code_generation_time: Date;
  failed_checkcode_count: number;
  prevent_checkcode_before: Date;

  active_account: boolean;
};
