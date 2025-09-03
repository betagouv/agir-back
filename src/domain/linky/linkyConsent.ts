export type LinkyConsent = {
  id: string;
  utilisateurId: string;
  date_consentement: Date;
  date_fin_consentement: Date;
  texte_signature: string;
  nom: string;
  email: string;
  prm: string;
  ip_address: string;
  user_agent: string;
  unsubscribed_prm: boolean;
};
