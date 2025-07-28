import { Tag_v2 } from './Tag_v2';

export const ComputedTagList: { [key in Tag_v2]?: string } = {
  est_un_contenu_local:
    'Tag dynamique affecté aux contenus détectés comme locaux',
  recommandation_winter:
    'Tag dynamiquement affecté aux actions recommandées par Winter pour un utilisateur donné',
  habite_zone_peri_urbaine:
    'Tag dynamique affecté aux utilisateurs péri urbains',
  habite_zone_urbaine: 'Tag dynamique affecté aux utilisateurs urbains',
  habite_zone_rurale: 'Tag dynamique affecté aux utilisateurs ruraux',

  risque_adresse_argile: `Risque géotechnique à l'adresse, moyen ou plus`,
  risque_adresse_inondation: `Risque d'inondation à l'adresse, moyen ou plus`,
  risque_adresse_radon: `Risque d'exposition au radon à l'adresse, moyen ou plus`,
  risque_adresse_secheresse: `Risque de secheresse à l'adresse, moyen ou plus`,
  risque_adresse_seisme: `Risque de seisme à l'adresse, moyen ou plus`,
  risque_adresse_submersion: `Risque de submersion à l'adresse, moyen ou plus`,
  risque_adresse_tempete: `Risque tempete à l'adresse, moyen ou plus`,
  risque_commune_catnat: `Commune avec plus de 5 arrêt catastrophe naturelle`,
  risque_commune_argile: `Commune avec plus de 50% de surface en risque geotechnique`,
  risque_commune_inondation: `Commune avec plus de 10% de surface en risque inondation`,
  match_aucun_autre_tag: `Tag valorisé à vrai si un contenu n'a aucun autre tag qui match, utilisé a priori pour exlure du contenu qui ne match pas au moins un tag`,
};
