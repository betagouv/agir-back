import { AideHistory_v0 } from '../object_store/history/history_v0';

export class AideHistory {
  content_id: string;
  vue_at: Date;
  deroulee_at: Date;
  clicked_infos: boolean;
  clicked_demande: boolean;

  constructor(data?: Partial<AideHistory_v0>) {
    if (data) {
      this.content_id = data.content_id;
      this.clicked_infos = !!data.clicked_infos;
      this.clicked_demande = !!data.clicked_demande;
      this.vue_at = data.vue_at;
      this.deroulee_at = data.deroulee_at;
    }
  }
}
