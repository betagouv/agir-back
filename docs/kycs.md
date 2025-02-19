# Gestion des KYCs

Une _KYC_ correspond à une question qui peut être posée à plusieurs endroits au
même utilisateurice et dont la réponse permet de personnaliser l'expérience, en
adaptant le contenu affiché, les questions posées, etc.

Elles sont définies dans le [CMS](cms.md).

## Gestion des simulations Publicodes

Actuellement, la plus part des KYCs sont utilisées pour effectuer le calcul du
[bilan carbone](./bilan-carbone-ngc.md).

Afin de pouvoir reconstruire une [situation](./bilan-carbone-ngc.md) Publicodes
à partir d'une KYC, il est nécessaire de pouvoir associer une KYC à une règle
du modèle de calcul. Cette association est faite directement dans le CMS avec
les champs `is_ngc` et `ngc_key`. Ainsi, il est facile de reconstruire une
situation à partir de la liste des KYCs répondues par l'utilisateurice.

Cependant, avec l'ajout de nouveau simulateur Publicodes, il est nécessaire
d'utiliser une solution plus générique afin d'éviter d'ajouter une liste de
champs à chaque KYC.

La solution choisie (et actuellement tester avec le simulateur voiture),
consiste à faire l'association des KYCs avec les règles (resp. valeurs) des
différents modèles Publicodes directement dans le code. Cela permet de profiter
du typechecking et de s'assurer que chaques règles est toujours présente dans
le modèle.
