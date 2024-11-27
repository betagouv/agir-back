import {
  AideHistory_v0,
  QuizzHistory_v0,
} from '../object_store/history/history_v0';

export class AideHistory {
  content_id: string;
  clicked_infos: boolean;
  clicked_demande: boolean;

  constructor(data?: AideHistory_v0) {
    if (data) {
      this.content_id = data.content_id;
      this.clicked_infos = !!data.clicked_infos;
      this.clicked_demande = !!data.clicked_demande;
    }
  }
}
