import { Thematique } from '../contenu/thematique';
import { ExtraUnivers } from './extraUnivers';

export const Univers = { ...ExtraUnivers, ...Thematique };
export type Univers = ExtraUnivers | Thematique;
