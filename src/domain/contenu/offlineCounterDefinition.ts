import { TypeAction } from '../actions/typeAction';

export enum OfflineCounterType {
  action = 'action',
  article = 'article',
  aide = 'aide',
}

export class OfflineCounterDefinition {
  id: string;
  id_cms: string;
  type_contenu: OfflineCounterType;
  type_action: TypeAction;
  code: string;
  nombre_vues: number;

  constructor(data: OfflineCounterDefinition) {
    Object.assign(this, data);
  }
}
