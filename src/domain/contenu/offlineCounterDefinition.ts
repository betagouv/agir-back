import { TypeAction } from '../actions/typeAction';

export enum OfflineCounterType {
  action = 'action',
  article = 'article',
  aide = 'aide',
}

export type OfflineCounterInitialisator = {
  id_cms: string;
  type_contenu: OfflineCounterType;
  type_action: TypeAction;
  code: string;
};

export type OfflineCounterDefinition = {
  id: string;
  nombre_vues: number;
} & OfflineCounterInitialisator;
