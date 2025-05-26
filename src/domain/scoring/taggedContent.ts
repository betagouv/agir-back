import { Thematique } from '../thematique/thematique';
import { ScoredContent } from './scoredContent';
import { Tag_v2 } from './system_v2/Tag_v2';
import { Tag } from './tag';

export interface TaggedContent extends ScoredContent {
  getTags(): Tag[];
  getInclusionTags(): Tag_v2[];
  getExclusionTags(): Tag_v2[];
  getDistinctText(): string;
  getThematique(): Thematique;
  isLocal(): boolean;
}
