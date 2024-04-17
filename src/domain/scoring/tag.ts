import { TagApplicatif } from './tagApplicatif';
import { TagUtilisateur } from './tagUtilisateur';

export const Tag = { ...TagApplicatif, ...TagUtilisateur };
export type Tag = TagApplicatif | TagUtilisateur;
