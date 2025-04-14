# Intégration de Mes Aides Reno

_J'agis_ intègre le service https://mesaidesreno.beta.gouv.fr via une iframe. Ce
choix a été fait pour faciliter l'intégration et ne pas avoir à refaire la
logique du simulateur qui est relativement complexe.

Cette intégration n'a pas pour but de remplacer l'expérience complète
disponible sur https://mesaidesreno.beta.gouv.fr. Elle s'arrête jusqu'au calcul
de l'éligibilité.

## Synchronisation des informations

Pour justifier son intégration dans _J'agis_, nous devons être capable de
préremplir les questions du simulateur Mes Aides Reno (MAR) avec les
informations connues de l'utilisateurice (et réciproquement).

### _J'agis_ -> MAR

Le transfert des information depuis _J'agis_ vers MAR se fait via les _search
params_ de l'iframe :

```
https://mesaidesreno.beta.gouv.fr/simulation?vous.propri%C3%A9taire.statut=%22propri%C3%A9taire%22*&logement.propri%C3%A9taire+occupant=oui*&logement.r%C3%A9sidence+principale+propri%C3%A9taire=oui*&logement.type=%22appartement%22*&logement.surface=60*&logement.p%C3%A9riode+de+construction=%22de+10+%C3%A0+15+ans%22*&logement.code+r%C3%A9gion=%2276%22&logement.code+d%C3%A9partement=%2231%22&logement.EPCI=%22243100518%22&logement.commune=%2231555%22*&logement.commune.nom=%22Toulouse%22&taxe+fonci%C3%A8re.commune.%C3%A9ligible=non&logement.commune.denormandie=non&m%C3%A9nage.personnes=3*&m%C3%A9nage.revenu=38719*&DPE.actuel=4*
```

Voici la liste des informations pouvant être préremplies :

- Le **DPE** : enum (A, B, C ...) -> 1 .. 7
- Le **logement a plus de 15 ans** : entier -> intervalle
- **Propriétaire** du logement : boolean -> `propriétaire` ou `non propriétaire` (il manque le cas `acquéreur`)
- **Propriétaire occupant** du logement : nous faisons l'hypothèse que dans le
  cas de J'agis, si l'utilisateurice est propriétaire, alors iel est occupant:e
- **Résidence principale, propriétaire et occupant** du logement : nous faisons
  l'hypothèse que dans le cas de J'agis, si l'utilisateurice est propriétaire,
  alors c'est également sa résidence principale.
- (**A VALIDER**) **Superficie** du logement : si l'utilisateurice a déjà
  répondu à la question précise, alors nous utilisons cette valeur, sinon nous
  utilisons les intervalles de `utilisateur.logement` où nous utilisons la valeur
  moyenne de l'intervalle courant.
- **Type du logement** : `maison`/`appartement`
- **Nombre de personnes** dans le ménage : nous faisons la somme du nombre
  d'enfant et d'adulte car MAR ne fait pas la distinction.
- **Revenu fiscal de référence**
- **Localisation du logement ET du ménage** : nous partons du principe que
  l'utilisateurice habite dans le logement utilisé pour le test vu que c'est son
  logement principal (côté MAR la distinction ménage/logement est faite).

> [!NOTE]
> La liste des questions (entrées) du calcul de MAR a été faite à la mains
> grâce au script
> [`questions-mes-aides-reno.ts`](../scripts/questions-mes-aides-reno.ts) et
> que par conséquent il est possible que toutes les entrées ne soient pas
> prises en comptes et peuvent évoluer.

### MAR -> _J'agis_

Nous récupérons les informations remplies par l'utilisateurice à la fin de la
simulation de l'éligibilité sur MAR via l'iframe qui renvoie la situation
(ensemble de clés/valeurs) correspondante à ses réponses :

```json
{
  "vous . propriétaire . statut": "\"propriétaire\"",
  "logement . propriétaire occupant": "non",
  "logement . résidence principale propriétaire": "non",
  "logement . type": "\"maison\"",
  "logement . surface": "30",
  "logement . période de construction": "\"au moins 15 ans\"",
  "ménage . personnes": "2",
  "ménage . code région": "\"76\"",
  "ménage . code département": "\"31\"",
  "ménage . EPCI": "\"243100518\"",
  "ménage . commune": "\"31555\"",
  "ménage . commune . nom": "\"Toulouse\"",
  "taxe foncière . commune . éligible . ménage": "non",
  "logement . commune . denormandie": "non",
  "ménage . revenu": "32197",
  "DPE . actuel": "3"
}
```

> [!IMPORTANT]
> Nous prenons en compte les réponses concernant le logement uniquement si
> l'utilisateurice l'a fait pour son logement principale (c'est-à-dire qu'iel est
> soit locataire, soit propriétaire est occupant:e du logement qui est sa résidence
> principale).

Voici la liste des informations récupérées :

- Le **DPE** : 1 .. 7 -> enum (A, B, C ...) _si logement principal_
- (**A VALIDER**) Le **logement a plus de 15 ans** : intervalle -> nombre, nous choisissons un
  âge arbitraire dans l'intervalle renseigné _si logement principal_
- **Propriétaire** du logement : `propriétaire` ou `non propriétaire` ->
  boolean (ignore si `acquéreur`) _si logement principal_
- **Superficie** du logement : entier -> entier + intervalle, nous stockons à
  la fois la surface précise dans la KYC correspondante et un intervalle pour le
  champs `utilisateur.logement.superficie` _si logement principal_
- **Type du logement** : `maison`/`appartement`
- (**A VALIDER**) **Nombre de personnes** dans le ménage : nous mettons à jour
  la KYC correspondante, en revanche, il n'est pas possible de faire la
  distinction parents/enfants comme sauvegardé dans le profil. Nous nous
  retrouvons donc avec deux valeurs différentes entre KYCs et profile
  utilisateurice.
- **Revenu fiscal de référence**
- **Utilise la localisation du logement** _si logement principal_
- **Utilise la localisation du ménage**
