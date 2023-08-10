export type OIDCState = {
  loginId: string;
  utilisateurId?: string;
  state?: string;
  nonce?: string;
  idtoken?: string;
};
