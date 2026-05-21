# Tests en React

> Stratégies et outils pour tester composants, hooks et applications React

---

## 1. Testing Fundamentals and Philosophy

### Pyramide des tests

```
       ╱─────────╲
      ╱   E2E    ╲       <- peu, lents, confiance élevée
     ╱─────────────╲
    ╱  Intégration  ╲    <- nombreux, modérés
   ╱─────────────────╲
  ╱       Unit         ╲ <- très nombreux, rapides, ciblés
```

Représentée sous forme de graphe, la pyramide met en évidence les proportions et le coût relatif de chaque niveau :

```mermaid
graph TD
    A[Pyramide des tests] --> B[Tests E2E<br/>Intégration de haut niveau]
    A --> C[Tests d'intégration<br/>Interactions entre composants]
    A --> D[Tests unitaires<br/>Fonctions individuelles]

    B --> B1[5-10 % des tests<br/>Exécution la plus lente<br/>Les plus coûteux]
    C --> C1[20-30 % des tests<br/>Vitesse moyenne<br/>Coût modéré]
    D --> D1[60-70 % des tests<br/>Exécution la plus rapide<br/>Les moins coûteux]

    style B fill:#ff6b6b
    style C fill:#ffd43b
    style D fill:#51cf66
```

### Modèle du « Testing Trophy » (écosystème React)

Popularisé par Kent C. Dodds, le trophée déplace le centre de gravité vers les tests d'intégration et ajoute une base statique (TypeScript, linting) :

```mermaid
graph TD
    A[Testing Trophy] --> B[End-to-End<br/>Parcours utilisateur critiques]
    A --> C[Intégration<br/>Interactions entre composants]
    A --> D[Unitaire<br/>Logique métier]
    A --> E[Statique<br/>TypeScript/Linting]

    B --> B1[10-15 %<br/>Validation centrée utilisateur]
    C --> C1[50-60 %<br/>Confiance maximale]
    D --> D1[20-30 %<br/>Détails d'implémentation]
    E --> E1[Toujours actif<br/>Vérification à la compilation]

    style E fill:#4dabf7
    style D fill:#51cf66
    style C fill:#ffd43b
    style B fill:#ff6b6b
```

### Cycle Test-Driven Development (TDD)

Le TDD repose sur trois phases répétées en boucle, souvent appelées **Red-Green-Refactor** :

```mermaid
graph LR
    A[Écrire un test qui échoue<br/>RED] --> B[Écrire le code minimal<br/>GREEN]
    B --> C[Refactoriser le code<br/>REFACTOR]
    C --> A

    A --> A1[Définir le comportement attendu<br/>Mentalité « test d'abord »]
    B --> B1[Implémenter la fonctionnalité<br/>Faire passer le test]
    C --> C1[Améliorer la qualité du code<br/>Maintenir l'état vert]

    style A fill:#ff6b6b
    style B fill:#51cf66
    style C fill:#4dabf7
```

### Philosophie « Test Like a User »

Tests qui se concentrent sur le **comportement observable** plutôt que sur les détails d'implémentation. Citation de Kent C. Dodds : *« The more your tests resemble the way your software is used, the more confidence they can give you. »*

---

## 2. Unit Testing with Jest

### Configuration de base

```tsx
// somme.test.ts
import { somme } from './somme';

describe('somme', () => {
  it('additionne deux nombres positifs', () => {
    expect(somme(2, 3)).toBe(5);
  });
});
```

### Matchers essentiels

- `toBe` : égalité pour les primitifs.
- `toEqual` : comparaison profonde d'objets.
- `toContain` : tableaux/chaînes.
- `toThrow` : une fonction lance.
- `toHaveBeenCalledWith` : spy appelé avec des arguments spécifiques.

### Lifecycle

`beforeAll`, `beforeEach`, `afterEach`, `afterAll` pour setup/teardown.

---

## 3. Component Testing with React Testing Library

### Philosophie de React Testing Library

React Testing Library encourage à interroger le DOM comme le ferait un utilisateur — via les rôles ARIA, les labels et le texte visible — plutôt qu'à inspecter l'état interne :

```mermaid
graph TD
    A[Principes de Testing Library] --> B[Tester le comportement utilisateur<br/>Pas l'implémentation]
    A --> C[Interroger par accessibilité<br/>HTML sémantique]
    A --> D[Éviter les détails internes<br/>Se concentrer sur la sortie]

    B --> B1[Interactions utilisateur<br/>Clic, saisie, soumission]
    C --> C1[getByRole, getByLabelText<br/>Requêtes accessibles]
    D --> D1[Tester ce que voit l'utilisateur<br/>Pas l'état interne]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
```

### Exemple

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Compteur } from './Compteur';

it('incrémente au clic', async () => {
  const utilisateur = userEvent.setup();
  render(<Compteur />);

  expect(screen.getByText('Compteur : 0')).toBeInTheDocument();
  await utilisateur.click(screen.getByRole('button', { name: /incrémenter/i }));
  expect(screen.getByText('Compteur : 1')).toBeInTheDocument();
});
```

### Queries recommandées

1. `getByRole` (préféré, accessible)
2. `getByLabelText` (formulaires)
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (dernier recours)

---

## 4. Writing Effective Test Cases

### Pattern AAA

- **Arrange** : préparez l'état et les mocks.
- **Act** : exécutez l'action.
- **Assert** : vérifiez le résultat attendu.

Visualisé comme un flux linéaire :

```mermaid
graph LR
    A[Arrange<br/>Préparer les données du test] --> B[Act<br/>Exécuter l'action]
    B --> C[Assert<br/>Vérifier le résultat]

    A --> A1[Créer les mocks<br/>Définir l'état initial<br/>Préparer les données]
    B --> B1[Appeler une fonction<br/>Cliquer sur un bouton<br/>Soumettre un formulaire]
    C --> C1[Vérifier la sortie<br/>Contrôler l'état<br/>Confirmer le comportement]

    style A fill:#4dabf7
    style B fill:#ffd43b
    style C fill:#51cf66
```

### Noms descriptifs

```tsx
it("affiche un message d'erreur quand l'email est invalide", ...);
it("désactive le bouton pendant l'envoi du formulaire", ...);
```

Évitez : `it('marche', ...)` ou `it('test 1', ...)`.

### Une assertion par concept

Plusieurs assertions sont acceptables si elles mesurent le même comportement. Séparez les tests quand ils décrivent des concepts différents.

---

## 5. Mocking API Calls and Dependencies

### Panorama des stratégies de mock

Plusieurs niveaux d'isolation sont possibles, du mock de fonction jusqu'à l'interception réseau :

```mermaid
graph TD
    A[Stratégies de mock] --> B[Mock functions de Jest<br/>jest.fn, jest.mock]
    A --> C[MSW<br/>Mock Service Worker]
    A --> D[Mocks manuels<br/>Dossier __mocks__]
    A --> E[Espions<br/>jest.spyOn]

    B --> B1[Mock au niveau fonction<br/>Mocks en ligne]
    C --> C1[Mock au niveau réseau<br/>Interception des requêtes HTTP]
    D --> D1[Mock au niveau module<br/>Remplacer un module entier]
    E --> E1[Espionner des méthodes existantes<br/>Surveiller les appels]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Mock de fetch

```tsx
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, nom: 'Marie' }),
    }) as any
  );
});
```

### MSW (Mock Service Worker)

Approche moderne : intercepte les requêtes HTTP au niveau réseau, laissez les composants inchangés :

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/utilisateurs', (req, res, ctx) => res(ctx.json([{ id: 1, nom: 'Marie' }])))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 6. Integration Testing Strategies

### Architecture des tests d'intégration

Les tests d'intégration couvrent plusieurs couches : composants, API, services tiers et gestion d'état :

```mermaid
graph TD
    A[Couches de tests d'intégration] --> B[Intégration de composants<br/>Plusieurs composants]
    A --> C[Intégration d'API<br/>Front-end + Back-end]
    A --> D[Intégration tierce<br/>Services externes]
    A --> E[Intégration du state management<br/>Redux/Context]

    B --> B1[Communication parent-enfant<br/>Prop drilling<br/>Gestion d'événements]
    C --> C1[Appels API réels<br/>Opérations sur la base<br/>Authentification]
    D --> D1[Passerelles de paiement<br/>Analytics<br/>API externes]
    E --> E1[Mises à jour du store<br/>Dispatch d'actions<br/>Test des selectors]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#ffd43b
    style D fill:#ffd43b
    style E fill:#51cf66
```

### Quoi tester

Une fonctionnalité complète : formulaire + soumission + réponse API + UI mise à jour. Gardez le mock au plus proche de la frontière (réseau, DB), pas au niveau du composant.

### Exemple

```tsx
it('complète le flux de connexion', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);

  await utilisateur.type(screen.getByLabelText(/email/i), 'marie@example.com');
  await utilisateur.type(screen.getByLabelText(/mot de passe/i), 'secret');
  await utilisateur.click(screen.getByRole('button', { name: /se connecter/i }));

  expect(await screen.findByText(/bienvenue, marie/i)).toBeInTheDocument();
});
```

---

## 7. End-to-End Testing with Cypress

### Architecture de Cypress

Cypress combine un test runner interactif, l'attente automatique, le time travel et le stubbing réseau :

```mermaid
graph TD
    A[Tests E2E Cypress] --> B[Test runner<br/>Interface interactive]
    A --> C[Attente automatique<br/>Assertions intelligentes]
    A --> D[Time travel<br/>Snapshots de débogage]
    A --> E[Stubbing réseau<br/>Contrôle des requêtes]

    B --> B1[Tests dans un vrai navigateur<br/>Chrome, Firefox, Edge]
    C --> C1[Réessai automatique des assertions<br/>Pas d'attentes manuelles]
    D --> D1[Visualisation des snapshots DOM<br/>Avant/après chaque commande]
    E --> E1[Mock des réponses API<br/>Interception des requêtes]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Setup

```bash
npm install --save-dev cypress
npx cypress open
```

### Exemple

```js
describe('Connexion', () => {
  it('connexion avec identifiants valides', () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('marie@example.com');
    cy.findByLabelText(/mot de passe/i).type('secret');
    cy.findByRole('button', { name: /se connecter/i }).click();
    cy.findByText(/bienvenue/i).should('be.visible');
  });
});
```

### Avantages

- Exécution réelle dans le navigateur.
- Time travel debugger.
- Network mocking intégré.

---

## 8. End-to-End Testing with Playwright

### Architecture de Playwright

Playwright vise les tests multi-navigateurs réellement parallèles, avec attente intégrée et interception réseau :

```mermaid
graph TD
    A[Tests E2E Playwright] --> B[Support multi-navigateur<br/>Chromium, Firefox, WebKit]
    A --> C[Mécanisme d'auto-wait<br/>Attente intégrée]
    A --> D[Exécution parallèle<br/>Tests rapides]
    A --> E[Interception réseau<br/>Mock des requêtes/réponses]

    B --> B1[Vrais tests cross-browser<br/>Émulation mobile]
    C --> C1[Tests fiables<br/>Pas de flakiness]
    D --> D1[Parallélisme par workers<br/>Contextes isolés]
    E --> E1[Route handlers<br/>Mock d'API]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Exemple

```ts
import { test, expect } from '@playwright/test';

test('connexion', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('marie@example.com');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByText('Bienvenue')).toBeVisible();
});
```

### Cypress vs Playwright

- **Cypress** : excellente expérience développeur, écosystème mature.
- **Playwright** : multi-navigateur (Chromium, Firefox, WebKit), plus rapide, parallélisation native.

---

## 9. Test Coverage and Quality Metrics

### Couverture

```bash
jest --coverage
```

Quatre métriques principales mesurent la couverture, chacune avec son seuil cible :

```mermaid
graph TD
    A[Types de couverture de code] --> B[Couverture des statements<br/>Lignes exécutées]
    A --> C[Couverture des branches<br/>Chemins conditionnels]
    A --> D[Couverture des fonctions<br/>Fonctions appelées]
    A --> E[Couverture des lignes<br/>Lignes exécutées]

    B --> B1[% de statements exécutés<br/>Objectif : 80 %+]
    C --> C1[% de chemins if/else parcourus<br/>Objectif : 75 %+]
    D --> D1[% de fonctions appelées<br/>Objectif : 90 %+]
    E --> E1[% de lignes de code exécutées<br/>Objectif : 80 %+]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#ffd43b
    style D fill:#51cf66
    style E fill:#51cf66
```

Seuils typiques :
- Statements : 80 %
- Branches : 75 %
- Functions : 80 %

### Attention

**100 % de couverture ne garantit pas la qualité**. Une ligne couverte peut ne pas être réellement testée. Les métriques servent d'alerte précoce, pas d'objectif final.

---

## 10. Testing Best Practices and Patterns

### Bonnes pratiques

1. **Tests déterministes** : pas de dates aléatoires, pas d'API réelles.
2. **Tests indépendants** : chacun peut tourner seul.
3. **Nommage clair** : le nom dit ce que fait le test.
4. **Setup minimal** : utilisez helpers et factories.
5. **Tests rapides** : séparez unit/integration/e2e.
6. **Run en CI** : bloque les merges si les tests échouent.

### Anti-patterns

- Tester l'implémentation (ex. noms de méthodes privées).
- Snapshots énormes et fragiles.
- Mocks trop profonds qui reproduisent la logique.
- Tests séquentiels qui dépendent les uns des autres.

---

## Conclusion

### Conclusion

Le testing en React est une discipline. Trois choses à retenir :

1. **Testez comme un utilisateur** : utilisez React Testing Library et des queries accessibles.
2. **Mock à la frontière** : utilisez MSW plutôt que des mocks manuels profonds.
3. **Pyramide équilibrée** : beaucoup d'unit, quelques integration, peu d'e2e critiques.
