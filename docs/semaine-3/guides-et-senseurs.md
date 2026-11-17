# Guides et senseurs du dépôt

Un **guide** donne des consignes en amont (feedforward). Un **senseur** observe le code ou son comportement et produit un retour (feedback). Le classement ci-dessous ne remplit que les catégories présentes dans le dépôt.

| Catégorie | Guide — feedforward | Senseur — feedback |
| --- | --- | --- |
| **Inférentiel** (consignes interprétées par une IA) | **Instructions Copilot** — [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) décrit l’architecture, les conventions et les validations attendues. Exemple : après une modification d’API, mettre à jour `backend/API.md` et les exemples HTTP, puis ajouter des tests de succès et d’erreur. **Séance :** fichier ouvert et consignes utilisées pour cette exploration; ce guide n’est pas un contrôle automatique. | **Aucun senseur inférentiel configuré.** Il n’y a pas de revue de code par IA définie dans le dépôt. Copilot a aidé à examiner les fichiers pendant la séance, mais cela ne constitue pas un senseur automatisé du projet. |
| **Computationnel** (règles ou calculs exécutables) | **Version de Node.js** — [`.nvmrc`](../../.nvmrc) et [`package.json`](../../package.json) indiquent respectivement Node 24 et une exigence `>=22.14.0`. Exemple : utiliser une version compatible pour exécuter le projet. **Séance :** configuration consultée; aucune commande dédiée de vérification de version n’a été lancée. | **Pipeline npm** — [`package.json`](../../package.json) orchestre Oxlint, TypeScript, Vitest et les builds via `npm run check`; les scripts détaillés sont dans [`backend/package.json`](../../backend/package.json) et [`frontend/package.json`](../../frontend/package.json). Exemple concret : [`backend/tests/db/constraints.test.ts`](../../backend/tests/db/constraints.test.ts) vérifie que SQLite refuse une offre dont le statut est inconnu ou le titre vide. **Séance :** `npm run check` exécuté avec succès : lint et vérifications TypeScript réussis, 119 tests backend et 49 tests frontend réussis, builds backend et frontend réussis. |

## Autres vérifications mentionnées

Le [modèle de pull request](../../.github/pull_request_template.md) demande de cocher que `npm run check` passe, que des tests couvrent les cas pertinents et que l’application a été testée dans le navigateur avec les profils concernés. C’est une checklist de processus, pas un senseur exécuté automatiquement. Le pipeline `npm run check` a été exécuté pendant cette séance; la vérification manuelle dans le navigateur ne l’a pas été.

Aucun workflow GitHub Actions n’est présent dans `.github/` : le pipeline existe sous forme de scripts npm, mais son exécution automatique par CI n’est pas configurée dans ce dépôt.
