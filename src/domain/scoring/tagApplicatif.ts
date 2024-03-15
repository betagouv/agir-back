import { Thematique } from '../contenu/thematique';
import { TagRubrique } from './tagRubrique';

export const TagApplicatif = { ...TagRubrique, ...Thematique };
export type TagApplicatif = TagRubrique | Thematique;
