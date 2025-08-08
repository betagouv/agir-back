# Règles de filtration des contenus locaux

Afin de ne montrer que les contenus locaux concernés par l'utilisateur·ices,
certains contenus sont filtrés géographiquement par rapport à la commune où se
situe l'utilisateur·ice. C'est le cas pour les aides et les articles.

## Définition dans le CMS

Historiquement, plusieurs méthodes ont existées pour déterminer si un contenu
doit être affiché uniquement pour certaines communes, CC, régions ou
départements.

### Historique des modifications

Voici un bref historique de l'évolution des champs :

1. Initialement les aides et articles étaient filtrés géographiquement via le
   champs `codes_postaux` permettant de renseigner un ensemble de codes postaux
   de communes pour lesquelles l'aide ou l'article devait être affiché.

   Cependant, cette méthodes n'étaient pas assez précises et fiables, en effet,
   plusieurs communes peuvent être identifiées par un même code postal.

2. La solution a donc consisté à utiliser les codes INSEE des communes, les
   codes SIREN des EPCI, et différencier les codes des départements et de
   régions pour avoir des identifiants uniques pour chaque échelles et réduire les
   sources d'erreurs en devant renseigner tous les codes de communes d'une EPCI ou
   région. Ce sont les champs `include_codes_commune`, `exclude_codes_commune`,
   `codes_departement` et `codes_region`.

3. Finalement, afin d'éviter d'avoir à renseigner les mêmes listes de codes
   INSEE pour chaque aides de la même zone géographique, le filtrage se fait
   via l'**association à chaque aide et article à un _partenaire_** (ou plusieurs)
   qui représente l'entité à l'initiative de cette aide ou article. Et qui possède
   elle-même une délimitation géographique.

### Fonctionnement à date

Aujourd'hui, voici les règles de gestions pour le filtrage géographique des aides et articles :

- Toute aide ou article local et en production devrait être associé à au moins un partenaire.
- Ce partenaire détermine la filtre géographique au détriment de tous les
  champs legacy (`include_codes_commune`, `codes_departement` et
  `codes_region`). **À l'exception** :
  - A l'exception des aides reliés à des CC, pour lesquelles on utilise les
    `codes_postaux` si renseignés et sans partenaires,
  - et du champs `exclude_codes_commune` qui est prioritaire sur le reste.

> [!NOTE]
> La gestion des CC devrait être rediscuté soit pour utiliser les partenaires,
> ou bien, si on souhaite garder une granularité plus fine, utiliser à minima
> les codes INSEE des communes plutôt que leurs codes postaux.

## Fonctionnement technique

Pour permettre de filtrer chaque aide ou article en fonction de la zone
géographique de son partenaire associé, les codes communes, de région et
départements de la zone de chaque partenaire sont calculés et ajoutés à la
définition de l'aide ou l'article dans les champs
`codes_commune_from_partenaire`, `codes_departement_from_partenaire` et
`codes_region_from_partenaire`.

Le calcul et la mise à jour de ses champs est effectué automatiquement à :

- chaque ajout ou modification d'un partenaire dans le CMS (via
  `PartenaireUsecase.updateFromPartenaireCodes()`),
- chaque ajout ou modification d'une aide ou d'un article dans le CMS (via
  `PartenaireUsecase.external_compute_communes_departement_regions_from_liste_partenaires()`),
- par le script nocturne `nightly_processing.sh`.

Il est également possible de déclencher manuellement la mise à jour des via les
routes admin suivantes :

- `/admin/compute_all_aides_communes_from_partenaires`
- `/admin/compute_all_articles_communes_from_partenaires`
