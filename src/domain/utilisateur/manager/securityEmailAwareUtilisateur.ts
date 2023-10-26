export type SecurityEmailAwareUtilisateur = {
  // FIXME : rename, remove 'code' word
  id: string;
  sent_code_count: number;
  prevent_sendcode_before: Date;
};
