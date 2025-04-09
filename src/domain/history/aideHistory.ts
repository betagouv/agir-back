import { AideHistory_v0 } from '../object_store/history/history_v0';

export class AideHistory {
  content_id: string;
  vue_at: Date;
  clicked_infos: boolean;
  clicked_demande: boolean;
  like_level: number;
  feedback: string;
  est_connue_utilisateur: boolean;
  sera_sollicitee_utilisateur: boolean;

  constructor(data?: Partial<AideHistory_v0>) {
    if (data) {
      this.content_id = data.content_id;
      this.clicked_infos = !!data.clicked_infos;
      this.clicked_demande = !!data.clicked_demande;
      this.est_connue_utilisateur = data.est_connue_utilisateur;
      this.sera_sollicitee_utilisateur = data.sera_sollicitee_utilisateur;
      this.vue_at = data.vue_at;
      this.feedback = data.feedback;
      this.like_level = data.like_level;
    }
  }
}
