import { ExplicationScore } from './system_v2/ExplicationScore';

export interface ScoredContent {
  score: number;
  explicationScore?: ExplicationScore;
}
