## Audit des tests — recherche par mot-clé des offres (EF-30)

Les tests ci-dessous ont été ajoutés avant l'implémentation. Ils échouaient alors
parce que le paramètre de recherche n'était pas pris en compte et que le champ de
recherche ainsi que le message dédié n'existaient pas encore.

| Constat vérifié | Test ajouté ou amélioré | Résultat |
|---|---|---|
| La recherche porte sur une expression contenue dans le titre et ne distingue pas les majuscules des minuscules. Les espaces au début et à la fin de la saisie sont ignorés. | Backend — `recherche une expression dans le titre sans tenir compte de la casse ni des espaces extérieurs` (`GET /offers?q=...`) | Réussi : « API REST DE FACTURATION » avec espaces extérieurs retrouve l'offre « API REST de facturation ». |
| Les mots saisis sont recherchés comme une expression entière, pas comme des mots indépendants. | Backend — `recherche les mots comme une expression entière` | Réussi : « API facturation » ne retourne aucune offre, car cette expression contiguë n'existe dans aucun titre. |
| La recherche et le filtre par période sont appliqués ensemble. | Backend — `combine la recherche par titre avec le filtre par période` ; frontend — `transmet la recherche de titre normalisée avec la période sélectionnée` | Réussi : « API REST » avec P1 ne retourne rien ; avec P2 retourne l'offre de facturation. L'interface transmet aussi les deux paramètres après normalisation des espaces extérieurs. |
| Une recherche composée uniquement d'espaces est traitée comme une recherche vide ; l'étudiant conserve sa liste normalement accessible. | Backend — `ignore une recherche vide et conserve la visibilité des étudiants` | Réussi : la requête vide retourne les offres publiées accessibles à l'étudiant. |
| La recherche ne permet pas à un étudiant de voir une offre non publiée. | Backend — `ignore une recherche vide et conserve la visibilité des étudiants` | Réussi : la recherche « client », qui correspond à une offre non publiée, retourne une liste vide pour l'étudiant. |
| Une recherche sans correspondance affiche un message explicite dans la page des offres. | Frontend — `affiche un message adapté quand la recherche ne correspond à aucune offre` | Réussi : le message « Aucune offre ne correspond à votre recherche. » est affiché. |

### Tests concernés

- Ajout de 4 cas d'intégration dans `backend/tests/offers.test.ts`.
- Ajout de 2 cas d'interface dans `frontend/tests/OffersPage.test.tsx`.
- Validation finale : `npm run check` réussi ; 127 tests backend et 53 tests frontend
  passent, avec lint, vérification TypeScript et builds.

## Autre constat — hook

Lors de la demande de suppression du fichier, Copilot a répondu :

> Suppression bloquée par le hook Tool Guardian : demo-protected.txt est protégé. Le fichier a été conservé.
