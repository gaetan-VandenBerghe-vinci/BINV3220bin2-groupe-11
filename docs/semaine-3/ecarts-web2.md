# Audit des guides du projet par rapport à Web 2

## Objet et périmètre

Ce rapport compare les consignes actuellement écrites dans le dépôt au référentiel Web 2 fourni pour l’audit. Il porte sur les guides applicables aux agents et aux développeurs : [instructions Copilot](../../.github/copilot-instructions.md), [README](../../README.md), [architecture](../architecture.md), [contrat API](../../backend/API.md) et [checklist de pull request](../../.github/pull_request_template.md).

Aucun `AGENTS.md`, guide `CONTRIBUTING` ou guide de style séparé n’a été trouvé. Les bilans de séances, le cahier des charges métier et les sources du code n’ont pas été considérés comme des consignes de style, sauf lorsqu’ils clarifient le fonctionnement documenté.

Les statuts signifient :
- **Oui** : la règle est clairement écrite dans un guide.
- **Partielle** : une partie de l’attente est indiquée ou seulement illustrée par des exemples.
- **Non** : la règle n’est pas écrite. Pour les règles DOM, cela signifie aussi qu’elles ne correspondent pas au frontend React actuel.
- **Contradiction** : une consigne du dépôt demande explicitement le contraire du référentiel fourni.

Le référentiel Web 2 ci-dessous est celui figurant dans la demande d’audit; aucun document source distinct du cours n’a été fourni pour vérifier ses citations.

## Résumé des écarts

| Attente Web 2 | Statut | Explication courte |
| --- | --- | --- |
| Validation défensive des entrées | Oui | Les contrôleurs et le contrat API décrivent la validation des paramètres et des corps. |
| Séparation des couches backend | Partielle | La séparation contrôleur/service/repository est détaillée, mais le dépôt n’a pas de dossier `routes/` séparé. |
| Codes HTTP et ressources REST | Partielle | Les réponses sont documentées; les chemins backend omettent volontairement le préfixe `/api` du proxy Vite. |
| En-tête Bearer pour JWT | Contradiction | Le guide demande explicitement d’envoyer le jeton sans préfixe. |
| TypeScript strict et interdiction de `any` | Partielle | Le README mentionne la règle Oxlint `any`, sans écrire une interdiction totale ni préciser les types dédiés attendus. |
| Types Express explicites | Partielle | Les guides séparent les services de `Request`/`Response`, mais ne donnent pas la règle de typage des handlers. |
| ESLint et Prettier | Partielle | Le projet documente Oxlint, pas ESLint ni Prettier. |
| Sécurité des mots de passe et secrets | Partielle | L’authentification actuelle est une démo sans mot de passe; les règles pour une future authentification réelle manquent. |
| Règles DOM classique | Non | Le frontend du dépôt est React; aucune règle DOM classique n’est formulée. |
| Conventions React | Partielle à Non | L’architecture et des exemples existent, mais la plupart des règles de composants, d’état, de formulaires et de clés ne sont pas explicites. |
| Navigation React Router | Partielle | React Router est choisi et les routes sont mentionnées; les règles d’emploi de `Link`/`NavLink` ne sont pas écrites. |

## Détails et formulations proposées

### Backend et TypeScript

**Typage strict et absence de `any` — Partielle.** Le [README](../../README.md), dans « Choix techniques », dit qu’Oxlint couvre notamment `any`. Les guides ne déclarent pas que tout usage est interdit, ni qu’il faut créer des types dédiés pour les modèles et payloads.

À ajouter aux « Conventions » des [instructions Copilot](../../.github/copilot-instructions.md) :

> Le code TypeScript respecte le mode strict. L’usage de `any` est interdit; définir un type ou une interface explicite pour les modèles, paramètres et payloads. Utiliser `unknown` lorsqu’une valeur externe n’est pas encore validée.

**Typage des routes et middlewares — Partielle.** Les [instructions Copilot](../../.github/copilot-instructions.md), rubrique « Architecture », précisent que les services ne reçoivent pas `Request` ni `Response`. Elles n’exigent pas de typer explicitement les handlers ni leurs retours.

À ajouter :

> Typer explicitement les paramètres des handlers Express (`Request`, `Response`, `NextFunction`) et leurs valeurs de retour. Garder les types Express dans la couche HTTP; les services ne reçoivent ni `Request` ni `Response`.

**ESLint et Prettier — Partielle, avec différence d’outillage.** Le [README](../../README.md), rubriques « Commandes » et « Choix techniques », impose Oxlint sans avertissements tolérés. Il ne documente ni ESLint ni Prettier. Le projet peut conserver ses outils actuels, mais le guide doit expliquer si Oxlint remplace ESLint et quel outil assure le formatage.

Formulation à ajouter après arbitrage avec les exigences du cours :

> Avant une PR, exécuter le linter et le formateur configurés par le dépôt. Aucun avertissement ni erreur n’est accepté. Dans ce projet, préciser si Oxlint remplace ESLint et si Prettier est utilisé ou non.

Si le cours exige réellement ESLint et Prettier comme outils, la règle doit être accompagnée de leur configuration et des scripts correspondants; une simple mention dans le guide ne suffit pas.

**Architecture et responsabilités — Partielle, mais cohérente dans son intention.** Les [instructions Copilot](../../.github/copilot-instructions.md) et [docs/architecture.md](../architecture.md) décrivent `controllers -> services -> repositories -> SQLite`, avec validation HTTP dans les contrôleurs et règles métier dans les services. Le projet n’a toutefois pas de dossier `routes/` distinct : les contrôleurs déclarent également les routes.

Pour lever l’ambiguïté sans imposer un refactor :

> Les routes Express sont déclarées dans les contrôleurs. Les contrôleurs valident les entrées HTTP et forment les réponses; les services appliquent les règles métier; les repositories effectuent les requêtes SQL. Ne pas déplacer la logique métier dans les routes ou les contrôleurs.

**REST, chemins et codes HTTP — Partielle.** [backend/API.md](../../backend/API.md) décrit des ressources plurielles, des paramètres comme `:offerId` et des statuts tels que `200`, `201`, `204`, `400`, `401`, `403`, `404` et `409`. Cependant, les chemins backend sont `/offers`, `/companies`, etc., tandis que le frontend appelle `/api/...`; le [guide d’architecture](../architecture.md) précise que Vite retire le préfixe `/api` avant de transmettre les requêtes.

À préciser dans le guide :

> Les URLs utilisées par le frontend commencent par `/api`; le proxy Vite retire ce préfixe. Les routes Express sont donc déclarées sans `/api`. Conserver les ressources au pluriel, les identifiants en paramètre d’URL et les codes HTTP documentés dans `backend/API.md`.

**Validation des entrées — Oui.** [docs/architecture.md](../architecture.md), section Backend, attribue aux contrôleurs la validation des paramètres et du corps. [backend/API.md](../../backend/API.md) documente les erreurs de requête et de corps invalides. Rien à ajouter d’essentiel; le rappel existant de tester les cas d’erreur dans la checklist de PR est utile.

**Authentification Bearer — Contradiction.** Les [instructions Copilot](../../.github/copilot-instructions.md), « Conventions », et [docs/architecture.md](../architecture.md), « Conventions particulières », disent d’envoyer le jeton directement dans `Authorization`, sans préfixe `Bearer`. C’est l’opposé de la convention Web 2 fournie.

Décision requise : si la convention du cours est obligatoire, modifier le middleware, le client, les exemples HTTP et `backend/API.md`, puis remplacer la consigne contradictoire. Si le protocole actuel est conservé pour une raison pédagogique ou technique validée, documenter explicitement cette dérogation et ne pas présenter la convention Bearer comme satisfaite.

**Mots de passe — Partielle / hors périmètre actuel.** Le [README](../../README.md), « Mode démo », et [backend/API.md](../../backend/API.md), « Authentification », précisent que la connexion démo n’utilise aucun mot de passe et que la connexion réelle n’est pas implémentée. Aucune règle pour l’ajout futur d’un mot de passe n’est formulée.

À ajouter :

> La connexion de démonstration ne stocke aucun mot de passe. Si une authentification par mot de passe est ajoutée, ne jamais stocker de mot de passe en clair; utiliser un hachage adaptatif tel que bcrypt et vérifier les identifiants côté serveur.

**Secrets JWT — Partielle.** Le [README](../../README.md) indique que `npm run setup` crée `backend/.env` avec une clé de signature aléatoire et signale l’erreur `JWT_SECRET absent ou trop court`. Il ne formule pas explicitement l’interdiction de coder un secret en dur ni de le committer.

À ajouter :

> Lire le secret JWT depuis la configuration d’environnement (`JWT_SECRET`). Ne jamais coder un secret en dur ni committer un fichier `.env` contenant une valeur secrète.

### Frontend DOM classique

Le dépôt documente une application React/Vite, pas un frontend construit directement avec l’API DOM. Ces attentes Web 2 sont donc **Non documentées** pour le moment et ne doivent pas être appliquées mécaniquement au code React. Si du JavaScript DOM impératif est introduit, ajouter au guide une règle dédiée :

> Dans le code DOM impératif, sélectionner les éléments avec `querySelector` ou `querySelectorAll`; enregistrer les événements avec `addEventListener`, jamais avec des attributs HTML inline. Pour un formulaire, appeler `event.preventDefault()` dans le gestionnaire de soumission. Ne pas insérer de contenu non fiable avec `innerHTML`; préférer `textContent` et `createElement`.

### React et React Router

**Nommage des composants et hooks — Partielle.** [docs/architecture.md](../architecture.md) donne des exemples tels que `CompaniesPage.tsx`, `CompanyTable` et `useCompanies`, mais n’énonce pas cette convention comme une règle.

À ajouter :

> Nommer les composants React en PascalCase et les fichiers de composants en `.tsx`. Nommer les hooks en camelCase avec le préfixe `use`.

**Props typées — Partielle.** Le [guide d’architecture](../architecture.md) décrit les props utilisées pour transmettre le jeton et les callbacks, mais n’exige pas un type ou une interface explicite pour chaque composant.

À ajouter :

> Définir un type ou une interface explicite pour les props de tout composant qui en reçoit; éviter les props non typées ou implicitement élargies.

**Clés de listes — Non.** Aucun guide ne mentionne la prop `key` ni la stabilité des clés dans les rendus issus de `.map()`.

À ajouter :

> Chaque élément rendu par `.map()` doit recevoir une `key` stable, fondée sur l’identifiant unique de la ressource. Ne pas utiliser l’index du tableau comme clé.

**Immuabilité de l’état — Non.** Aucun guide ne demande d’éviter la mutation directe de l’état.

À ajouter :

> Ne jamais modifier directement un état React. Produire une nouvelle valeur avec le spread operator ou une méthode non mutante comme `map` et `filter`.

**Mise à jour fonctionnelle de l’état — Non.** Aucun guide ne mentionne la forme fonctionnelle de `setState`/`set...` lorsque la mise à jour dépend de la valeur précédente.

À ajouter :

> Quand le nouvel état dépend de l’état précédent, utiliser la forme fonctionnelle du setter, par exemple `setItems(previous => ...)`.

**Lifting state up — Partielle.** Le [guide d’architecture](../architecture.md) précise que `useAuth` est appelé une seule fois dans `App` et que session et callbacks sont transmis aux pages. C’est un exemple de partage d’état, mais pas une règle générale.

À ajouter :

> Lorsqu’un état est partagé par plusieurs composants, le placer dans leur plus proche ancêtre commun et transmettre les valeurs et actions nécessaires par props ou par le mécanisme de contexte déjà adopté.

**Formulaires contrôlés — Non.** Aucun guide n’exige que les valeurs de champs React soient liées à l’état.

À ajouter :

> Par défaut, les formulaires React sont contrôlés : relier la valeur du champ (`value`) à l’état et mettre cet état à jour avec `onChange`. Traiter la soumission avec `onSubmit`.

**Navigation SPA — Partielle.** Le [README](../../README.md) mentionne le choix de React Router et [docs/architecture.md](../architecture.md) indique que `App.tsx` porte les routes. Les guides ne disent pas quelle primitive utiliser pour naviguer.

À ajouter :

> Pour une navigation interne à l’application, utiliser `Link`, `NavLink` ou `useNavigate` de React Router. Réserver `<a href>` aux liens externes ou à l’ouverture volontaire d’une ressource hors de la SPA.

## Autre incohérence documentaire

Le [README](../../README.md), dans « Ce qui n’est pas implémenté », indique encore que la candidature et le retrait d’une candidature ne sont pas implémentés. Pourtant, [backend/API.md](../../backend/API.md) documente déjà `POST /offers/:offerId/applications` et `DELETE /offers/:offerId/applications`. Mettre à jour cette liste pour éviter que les agents et développeurs s’appuient sur une information périmée.

## Conclusion

Les consignes actuelles sont précises sur les couches backend, la validation, les droits, les migrations et les vérifications à lancer. Les écarts les plus importants sont la contradiction explicite sur le préfixe Bearer, l’absence de règles de sécurité pour une future authentification réelle et le manque de conventions React détaillées. Enfin, les règles DOM classique ne sont pas adaptées directement au frontend React actuel, et le README doit être synchronisé avec l’API déjà implémentée.
