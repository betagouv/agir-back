import { Bilan } from './bilan';

export type BilanExtra = Bilan & {
  created_at: Date;
  id: string;
};
