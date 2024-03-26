import { Tag } from './tag';

export interface TaggedContent {
  getTags(): Tag[];
  score: number;
}
