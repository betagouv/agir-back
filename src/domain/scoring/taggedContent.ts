import { ScoredContent } from './scoredContent';
import { Tag } from './tag';

export interface TaggedContent extends ScoredContent {
  getTags(): Tag[];
  getDistinctText(): string;
}
