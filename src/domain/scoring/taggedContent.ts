import { Tag } from './tag';

export interface TaggedContent {
  getTags(): Tag[];
  getDistinctText(): string;
  score: number;
}
