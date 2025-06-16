import { Thematique } from '../thematique/thematique';
import { ScoredContent } from './scoredContent';
import { Tag } from './tag';

export interface TaggedContent extends ScoredContent {
  getTags(): Tag[];
  getInclusionTags(): string[];
  getExclusionTags(): string[];
  getDistinctText(): string;
  getThematiques(): Thematique[];
  isLocal(): boolean;
}
