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

### Questions de types mosaiques

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

Pour les mosaique de type _booléen_ le comportement attendu est le suivant :

- si aucune réponses n'est sélectionnées (c'est-à-dire que la question est
  passée), alors toutes les réponses entrées dans la situation NGC est à `null`,
  on utilise la valeur par défaut;
- sinon, toutes les réponses non sélectionnées sont implicitement évaluées à
  `non`.

> [!IMPORTANT]
> Cela suppose que les réponses d'une question de type mosaique envoyés à
> l'endpoint `utilisateurs/:utilisateur-id/questionsKYC_v2/:questionId`
> corresondent à TOUTES les sous-questions de la mosaique même si elles ne sont
> pas sélectionnées.
>
> Par exemple, pour la mosaique `MOSAIC_CHAUFFAGE` voici ce qui est attendu si
> uniquement le mode "Réseau de chaleur" est sélectionné :
>
> ```json
> [
>   { "code": "KYC_chauffage_bois", "selected": false },
>   { "code": "KYC_chauffage_fioul", "selected": false },
>   { "code": "KYC_chauffage_gaz", "selected": false },
>   { "code": "KYC_chauffage_elec", "selected": false },
>   { "code": "KYC_chauffage_pompe_chaleur", "selected": false },
>   { "code": "KYC_chauffage_reseau", "selected": true }
> ]
> ```
