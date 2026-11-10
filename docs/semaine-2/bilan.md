### choix : quels sont les choix que vous avez pris lors de la plannification ###
1) on m'a demander si je voulais faire l'EF-32 sur le backend/frontend ou backend seul ou frontend seul, j'ai choisi de faire la modification sur le backend/frontend car nous avions besoin de l'affichage pour ce qui est demandé (pas logique de faire que backend car par exemple le message optionnel n'aurait pas pu être entrer par l'utilisateur)

2) copilot nous a demander de choisir entre un soft delete ou un hard delete des candidatures, on a décidé de faire un hard delete car on ne voyait pas l'intérêt de garder une candidature retirer par le candidat. (aucune utilité de la conserver en BD).

3) il nous a demander si nous voulions permettre au candidat de repostuler une candidature pour le même stage malgré qu'il a retiré sa candidature précédente, et on a accepté car un étudiant pourrait très bien s'être tromper dans le message optionnel ou changer d'avis après avoir retiré sa candidature.

4) il nous a demandé si on voulait faire un panneau détail intégré ou de créer une page dédié aux détails, mais pour éviter qu'il touche trop aux codes, on a décidé de prendre le panneau de détail intégré à la même page.

### Résultat : ce qui fonctionne, ce qui n’a pas fonctionné, les difficultés et les limites restantes. ###
**CE QUI N'A PAS FONCTIONNE**
au premier prompt généré pour le EF-32, copilot a généré une mauvaise {} qui m'a donc créer une erreur lors du lancement, ensuite j'ai eu un soucis au niveau des tests que l'IA n'a pas su effectué (mais dû à un pc portable précis) mais à su le régler quand je lui ai posé la question. 

**CE QUI A BIEN FONCTIONNE**
en finalité l'agent ia a su faire quelque chose de correct et bien plus rapide que ce qu'on aurait pu effectué et en plus il n'était sensé faire que l'EF-32, mais a su faire l'EF-33 sans avoir eu une explication précis dessus, c'est à dire que dans le panneau de détails intégré, il a directement ajouté le status de la candidature dedans.

###  Modifications : les fichiers ajoutés ou modifiés et pourquoi ; les décisions prises après lecture du plan. ###
-backend/src/db/migrations/002_ef32_applications.sql
ce fichier a été ajouté pour la condition (une candidature active par étudiant pour la même offre)

-backend/src/repositories/offers.repository.ts
Ce fichier a été modifié pour ajouter des requêtes sql vers la BD pour récupérer les détails d'une offre avec son statut, insérer une candidature, vérifier l'existence d'une candidature active, et supprimer une candidature si l'étudiant a décidé de le retirer

-backend/src/services/offers.service.ts
Ce fichier a été modifié pour implémenter les règles métier, tel que vérifierl'offre choisis est bien en PUBLISHED, valider le format du message facultatif, bloquer les candidatures en doublon si une candidature actif existe déjà pour le même offre (par le même étudiant), et bloquer le retrait si la candidature n'est plus à l'état IN-PROGRESS

-backend/src/controllers/offers.controller.ts (modifié)
Déclarer et câbler les nouveaux points d'entrée HTTP (ex. GET /offers/:id, POST /offers/:id/apply, DELETE /offers/:id/application ou équivalent), mapper les DTOs, extraire l'ID étudiant de la session et renvoyer les statuts HTTP appropriés (201, 204, 400, 403, 404).

-backend/src/services/permissions.ts (modifié)
Restreindre strictement ces actions aux utilisateurs authentifiés avec le rôle STUDENT.

-backend/tests/offers.test.ts (modifié)
Ajouter la suite de 4 tests d'intégration dédiés à l'EF-32 (consultation d'une offre publiée, postulation avec message, retrait puis re-candidature, refus des cas interdits et contrôle des rôles)

-frontend/src/models/offer.ts (modifié)
Aligner les types frontend avec les nouveaux DTOs backend (détail de l'offre et état de candidature de l'étudiant connecté).

-frontend/src/services/offers.service.ts (modifié)
Implémenter les appels API côté client (fetch) vers les routes de détail, de candidature et de retrait, avec parsing et gestion d'erreurs via readJson.

-frontend/src/pages/OffersPage.tsx
panneau dépliable pour afficher la description complète de l'offre sélectionnée, zone de texte pour le message facultatif, boutons conditionnels (« Postuler », « Retirer ») et rafraîchissement des données après action.

-frontend/tests/OffersPage.test.tsx (modifié)
Ajouter les tests de composants React vérifiant le rendu du détail, l'envoi d'une candidature avec message, le retrait et l'affichage des états de chargement/erreurs.

### Validation fonctionnelle : les cas réellement essayés, les résultats observés et les corrections éventuelles. ###
On a testé toutes les fonctionnalités ajoutés par l'IA côté frontend via vitest, mais par contre comme mentionné plus haut, l'ia a tenté de faire des tests pour être sûre que tout était fonctionnel, mais malheureusement j'ai eu un soucis qu'il a su régler par la suite.

### Qualité : les points vérifiés dans le code, les problèmes repérés et les simplifications effectuées, s’il y en a. ###
Aucune. L'ia a effectué un travail remarquable.

### Tests et commandes : les tests ajoutés, les commandes exécutées et leurs résultats ; un exemple de comportement couvert par un test. ###
-backend/tests/offers.test.ts
-frontend/tests/OffersPage.test.tsx

npm run test -w backend -- tests/offers.test.ts
npm run typecheck -w frontend
npm run check

les deux premiers se sont bien passés, par contre npm run check n'est pas passé, et j'ai donc du lui demander de régler ça.

