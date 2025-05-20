# Calcul du bilan carbone

_J'agis_ utilise actuellement le modèle de calcul
[`@incubateur-ademe/nosgestesclimat`](https://publi.codes/@incubateur-ademe/nosgestesclimat)
pour effectuer le bilan carbone des utilisateurices et à terme, par
thématiques.

## Gestion des situations Publicodes

Le moteur [Publicodes](https://publi.codes) a besoin d'une
[_situation_](https://publi.codes/docs/api/publicodes/type-aliases/situation#example)
(c'est-à-dire un ensemble de clés/valeurs qui décrivent les paramètres du
calcul) pour effectuer un calcul.

Actuellement, il y a deux façons de récupérer une situation dans le serveur :

1. la reconstruire à partir des réponses aux KYCs renseignées par
   l'utilisateurice dans _J'agis_,
2. la récupérer depuis un webhook en provenance de nosgestesclimat.fr.

### Versionnage des situations

La situation est liée aux modèles de calcul, ainsi si ce dernier évolue en
renommant une règle ou en modifiant le type de valeur attendue pour une
énumération par exemple, la situation correspondant à une version antérieure du
modèle risque de ne plus être valide.

Pour éviter cela, il existe des [règles de
migrations](https://github.com/incubateur-ademe/nosgestesclimat/blob/preprod/migration/migration.yaml)
à appliquer sur une situation pour la rendre compatible avec la dernière
version du modèle.

> [!NOTE]
> Actuellement, le fichier de migration s'enrichit au fur et à mesure des
> nouvelles version. Cela pose le risque d'avoir des erreurs pour des versions
> trop anciennes. Par exemple, si une règle `foo` est renommée en `bar` dans la
> version 1, et que dans la version 2, une nouvelle règle `foo` est ajoutée
> (n'ayant rien à voir à celle de la version 0), alors la migration d'une
> situation de la version 0 à la version 2 causera une erreur car la règle
> `foo` d'une nouvelle situation 2, saura renommée en `bar`.
>
> Pour résoudre ce problème, il y a des discussions en cours dans l'équipe NGC
> pour avoir un fichier de migration par version. Il faudra donc également
> versionner explicitement les situations, ce qui permettra de pouvoir
> appliquer les bonnes migrations.

#### Migration à partir des KYCs

Chaque [KYCs](./kycs.md) utilisées dans _J'agis_ peut être associée à une règle du modèle de
NGC. Cependant, lors de l'évolution du modèle, il est possible que ces règles
soient renommées ou supprimées. Il est donc nécessaire de pouvoir appliquer les
migrations sur la situation reconstruite à partir des KYCs avant d'effectuer le
calcul. En effet, cela semble la solution la plus simple dans un premier temps
si on ne souhaite pas avoir à manuellement mettre à jour les KYCs pour chaque
montée de version cassante.

#### Migration à partir du webhook NGC

La migration des situation fournies par nosgestesclimat.fr est plus compliquée
car bien que l'on puisse attendre que la situation soit déjà à jours avec la
version du modèle utilisé sur nosgestesclimat.fr, il n'est pas garanti que
cette version soit la même que celle utilisée par _J'agis_ à cet instant.

Il est donc nécessaire de mettre en place un système garantissant que les
situations provenant de nosgestesclimat.fr soient compatibles avec la version
du modèle de _J'agis_.

## Les questions "mosaiques"

Le modèle NGC a introduit la notion de question _mosaique_ au-dessus des
questions (règles ayant comme rôle de paramètres/inputs du programme)
Publicodes. Elles permettent de regrouper plusieurs questions qui ne font sens
qu'en étant posées sur le même écran.

Par exemple, plutôt que de demander X questions du style "Avez-vous une pompe à
chaleur ?", "Vous chauffez-vous au gaz ?", etc... Elles permettent de poser une
seule question avec des _checkboxes_ pour chaque sous-question.

Pour l'instant il en existe de deux types : _booléen_ et _nombre_.

### Gestion côté _J'agis_

Côté _J'agis_, les mosaiques sont définies en dur dans le fichier
[`src/domain/kyc/mosaicKYC.ts`](../src/domain/kyc/mosaicKYC.ts)

> [!NOTE]
>
> _J'agis_ supporte uniquement les mosaique de type _booléen_ pour le moment.

#### Comportement particuliers
