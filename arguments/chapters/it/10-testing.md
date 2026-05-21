# Testing in React

> Strategie e strumenti per testare componenti, hooks e applicazioni React

---

## 1. Testing Fundamentals and Philosophy

### Piramide del Testing

```
       ╱─────────╲
      ╱   E2E    ╲       <- pochi, lenti, alta confidenza
     ╱─────────────╲
    ╱  Integrazione ╲    <- molti, moderati
   ╱─────────────────╲
  ╱       Unit         ╲ <- moltissimi, veloci, focalizzati
```

Rappresentata come grafo, la piramide evidenzia le proporzioni e il costo relativo di ogni livello:

```mermaid
graph TD
    A[Piramide del testing] --> B[Test E2E<br/>Integrazione di alto livello]
    A --> C[Test di integrazione<br/>Interazioni tra componenti]
    A --> D[Test unitari<br/>Funzioni individuali]

    B --> B1[5-10% dei test<br/>Esecuzione più lenta<br/>I più costosi]
    C --> C1[20-30% dei test<br/>Velocità media<br/>Costo moderato]
    D --> D1[60-70% dei test<br/>Esecuzione più veloce<br/>I meno costosi]

    style B fill:#ff6b6b
    style C fill:#ffd43b
    style D fill:#51cf66
```

### Modello "Testing Trophy" (ecosistema React)

Reso popolare da Kent C. Dodds, il trofeo sposta il baricentro verso i test di integrazione e aggiunge una base statica (TypeScript, linting):

```mermaid
graph TD
    A[Testing Trophy] --> B[End-to-End<br/>Flussi utente critici]
    A --> C[Integrazione<br/>Interazioni tra componenti]
    A --> D[Unitario<br/>Logica di business]
    A --> E[Statico<br/>TypeScript/Linting]

    B --> B1[10-15%<br/>Validazione centrata sull'utente]
    C --> C1[50-60%<br/>Massima confidenza]
    D --> D1[20-30%<br/>Dettagli di implementazione]
    E --> E1[Sempre attivo<br/>Verifica a tempo di compilazione]

    style E fill:#4dabf7
    style D fill:#51cf66
    style C fill:#ffd43b
    style B fill:#ff6b6b
```

### Ciclo Test-Driven Development (TDD)

Il TDD si basa su tre fasi ripetute in loop, comunemente chiamate **Red-Green-Refactor**:

```mermaid
graph LR
    A[Scrivere un test che fallisce<br/>RED] --> B[Scrivere il codice minimo<br/>GREEN]
    B --> C[Refactoring del codice<br/>REFACTOR]
    C --> A

    A --> A1[Definire il comportamento atteso<br/>Mentalità "test first"]
    B --> B1[Implementare la funzionalità<br/>Far passare il test]
    C --> C1[Migliorare la qualità del codice<br/>Mantenere lo stato verde]

    style A fill:#ff6b6b
    style B fill:#51cf66
    style C fill:#4dabf7
```

### Filosofia "Test Like a User"

Test che si focalizzano sul **comportamento osservabile** invece che sui dettagli implementativi. Cita Kent C. Dodds: *"The more your tests resemble the way your software is used, the more confidence they can give you."*

---

## 2. Unit Testing with Jest

### Setup di Base

```tsx
// somma.test.ts
import { somma } from './somma';

describe('somma', () => {
  it('somma due numeri positivi', () => {
    expect(somma(2, 3)).toBe(5);
  });
});
```

### Matcher Essenziali

- `toBe`: uguaglianza per primitivi.
- `toEqual`: confronto profondo di oggetti.
- `toContain`: array/stringhe.
- `toThrow`: una funzione lancia.
- `toHaveBeenCalledWith`: spy chiamato con argomenti specifici.

### Lifecycle

`beforeAll`, `beforeEach`, `afterEach`, `afterAll` per setup/teardown.

---

## 3. Component Testing with React Testing Library

### Filosofia di React Testing Library

React Testing Library incoraggia a interrogare il DOM come farebbe un utente — tramite ruoli ARIA, label e testo visibile — invece di ispezionare lo stato interno:

```mermaid
graph TD
    A[Principi di Testing Library] --> B[Testare il comportamento utente<br/>Non l'implementazione]
    A --> C[Interrogare per accessibilità<br/>HTML semantico]
    A --> D[Evitare i dettagli interni<br/>Concentrarsi sull'output]

    B --> B1[Interazioni utente<br/>Clic, digitazione, invio]
    C --> C1[getByRole, getByLabelText<br/>Query accessibili]
    D --> D1[Testare ciò che vede l'utente<br/>Non lo stato interno]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
```

### Esempio

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Contatore } from './Contatore';

it('incrementa al click', async () => {
  const utente = userEvent.setup();
  render(<Contatore />);

  expect(screen.getByText('Conteggio: 0')).toBeInTheDocument();
  await utente.click(screen.getByRole('button', { name: /incrementa/i }));
  expect(screen.getByText('Conteggio: 1')).toBeInTheDocument();
});
```

### Query Consigliate

1. `getByRole` (preferito, accessibile)
2. `getByLabelText` (form)
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (ultima risorsa)

---

## 4. Writing Effective Test Cases

### Pattern AAA

- **Arrange**: prepara stato e mock.
- **Act**: esegui l'azione.
- **Assert**: verifica il risultato atteso.

Visualizzato come flusso lineare:

```mermaid
graph LR
    A[Arrange<br/>Prepara i dati del test] --> B[Act<br/>Esegui l'azione]
    B --> C[Assert<br/>Verifica il risultato]

    A --> A1[Crea i mock<br/>Imposta lo stato iniziale<br/>Prepara i dati]
    B --> B1[Chiama una funzione<br/>Clicca un pulsante<br/>Invia un form]
    C --> C1[Controlla l'output<br/>Verifica lo stato<br/>Conferma il comportamento]

    style A fill:#4dabf7
    style B fill:#ffd43b
    style C fill:#51cf66
```

### Nomi Descrittivi

```tsx
it('mostra messaggio di errore quando l’email è invalida', ...);
it('disabilita il pulsante mentre il form viene inviato', ...);
```

Evita: `it('funziona', ...)` o `it('test 1', ...)`.

### Una Asserzione per Concetto

Più asserzioni vanno bene se misurano lo stesso comportamento. Suddividi i test quando descrivono concetti diversi.

---

## 5. Mocking API Calls and Dependencies

### Panoramica delle strategie di mock

Sono possibili diversi livelli di isolamento, dal mock di funzione fino all'intercettazione di rete:

```mermaid
graph TD
    A[Strategie di mock] --> B[Mock function di Jest<br/>jest.fn, jest.mock]
    A --> C[MSW<br/>Mock Service Worker]
    A --> D[Mock manuali<br/>Cartella __mocks__]
    A --> E[Spy<br/>jest.spyOn]

    B --> B1[Mock a livello di funzione<br/>Mock inline]
    C --> C1[Mock a livello di rete<br/>Intercetta richieste HTTP]
    D --> D1[Mock a livello di modulo<br/>Sostituisce moduli interi]
    E --> E1[Spia metodi esistenti<br/>Monitora le chiamate]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Mock di fetch

```tsx
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1, nome: 'Mario' }),
    }) as any
  );
});
```

### MSW (Mock Service Worker)

Approccio moderno: intercetta le richieste HTTP a livello di rete, mantieni i componenti inalterati:

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/utenti', (req, res, ctx) => res(ctx.json([{ id: 1, nome: 'Mario' }])))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 6. Integration Testing Strategies

### Architettura dei test di integrazione

I test di integrazione coprono più livelli: componenti, API, servizi di terze parti e gestione dello stato:

```mermaid
graph TD
    A[Livelli dei test di integrazione] --> B[Integrazione di componenti<br/>Più componenti]
    A --> C[Integrazione API<br/>Front-end + Back-end]
    A --> D[Integrazione di terze parti<br/>Servizi esterni]
    A --> E[Integrazione dello state management<br/>Redux/Context]

    B --> B1[Comunicazione parent-child<br/>Prop drilling<br/>Gestione eventi]
    C --> C1[Chiamate API reali<br/>Operazioni sul database<br/>Autenticazione]
    D --> D1[Gateway di pagamento<br/>Analytics<br/>API esterne]
    E --> E1[Aggiornamenti dello store<br/>Dispatch di azioni<br/>Test dei selector]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#ffd43b
    style D fill:#ffd43b
    style E fill:#51cf66
```

### Cosa Testare

Una funzionalità completa: form + invio + risposta API + UI aggiornata. Mantieni il mock il più vicino al confine (rete, DB), non al livello del componente.

### Esempio

```tsx
it('completa il flusso di login', async () => {
  const utente = userEvent.setup();
  render(<App />);

  await utente.type(screen.getByLabelText(/email/i), 'mario@example.com');
  await utente.type(screen.getByLabelText(/password/i), 'segreta');
  await utente.click(screen.getByRole('button', { name: /accedi/i }));

  expect(await screen.findByText(/benvenuto, mario/i)).toBeInTheDocument();
});
```

---

## 7. End-to-End Testing with Cypress

### Architettura di Cypress

Cypress combina un test runner interattivo, l'attesa automatica, il time travel e lo stubbing di rete:

```mermaid
graph TD
    A[Test E2E con Cypress] --> B[Test runner<br/>Interfaccia interattiva]
    A --> C[Attesa automatica<br/>Asserzioni intelligenti]
    A --> D[Time travel<br/>Snapshot di debug]
    A --> E[Stubbing di rete<br/>Controllo delle richieste]

    B --> B1[Test in un browser reale<br/>Chrome, Firefox, Edge]
    C --> C1[Riprova automatica delle asserzioni<br/>Nessuna attesa manuale]
    D --> D1[Visualizzazione degli snapshot del DOM<br/>Prima/dopo ogni comando]
    E --> E1[Mock delle risposte API<br/>Intercettazione richieste]

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

### Esempio

```js
describe('Login', () => {
  it('login con credenziali valide', () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('mario@example.com');
    cy.findByLabelText(/password/i).type('segreta');
    cy.findByRole('button', { name: /accedi/i }).click();
    cy.findByText(/benvenuto/i).should('be.visible');
  });
});
```

### Vantaggi

- Esecuzione reale nel browser.
- Time travel debugger.
- Network mocking incorporato.

---

## 8. End-to-End Testing with Playwright

### Architettura di Playwright

Playwright punta a test multi-browser realmente paralleli, con attesa integrata e intercettazione di rete:

```mermaid
graph TD
    A[Test E2E con Playwright] --> B[Supporto multi-browser<br/>Chromium, Firefox, WebKit]
    A --> C[Meccanismo di auto-wait<br/>Attesa integrata]
    A --> D[Esecuzione parallela<br/>Test rapidi]
    A --> E[Intercettazione di rete<br/>Mock di richieste/risposte]

    B --> B1[Veri test cross-browser<br/>Emulazione mobile]
    C --> C1[Test affidabili<br/>Niente flakiness]
    D --> D1[Parallelismo basato su worker<br/>Contesti isolati]
    E --> E1[Route handler<br/>Mock di API]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
```

### Esempio

```ts
import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('mario@example.com');
  await page.getByLabel('Password').fill('segreta');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await expect(page.getByText('Benvenuto')).toBeVisible();
});
```

### Cypress vs Playwright

- **Cypress**: ottimo developer experience, ecosistema maturo.
- **Playwright**: multi-browser (Chromium, Firefox, WebKit), più veloce, parallelizzazione nativa.

---

## 9. Test Coverage and Quality Metrics

### Coverage

```bash
jest --coverage
```

Quattro metriche principali misurano la coverage, ognuna con la propria soglia obiettivo:

```mermaid
graph TD
    A[Tipi di code coverage] --> B[Coverage degli statement<br/>Righe eseguite]
    A --> C[Coverage dei branch<br/>Percorsi condizionali]
    A --> D[Coverage delle funzioni<br/>Funzioni chiamate]
    A --> E[Coverage delle righe<br/>Righe eseguite]

    B --> B1[% di statement eseguiti<br/>Obiettivo: 80%+]
    C --> C1[% di percorsi if/else attraversati<br/>Obiettivo: 75%+]
    D --> D1[% di funzioni invocate<br/>Obiettivo: 90%+]
    E --> E1[% di righe di codice eseguite<br/>Obiettivo: 80%+]

    style A fill:#4dabf7
    style B fill:#51cf66
    style C fill:#ffd43b
    style D fill:#51cf66
    style E fill:#51cf66
```

Soglie tipiche:
- Statements: 80%
- Branches: 75%
- Functions: 80%

### Attenzione

**100% di coverage non garantisce qualità**. Una linea coperta può non essere veramente testata. Le metriche servono come early warning, non come obiettivo finale.

---

## 10. Testing Best Practices and Patterns

### Best Practice

1. **Test deterministici**: niente date casuali, niente API reali.
2. **Test indipendenti**: ognuno può girare da solo.
3. **Naming chiaro**: il nome dice cosa fa il test.
4. **Setup minimale**: usa helpers e factory.
5. **Test veloci**: split unit/integration/e2e.
6. **Run in CI**: blocca i merge se i test falliscono.

### Anti-pattern

- Testare l'implementazione (es. nomi di metodi privati).
- Snapshot enormi e fragili.
- Mock troppo profondi che riproducono la logica.
- Test che girano in sequenza dipendendo l'uno dall'altro.

---

## Conclusion

### Conclusione

Il testing in React è una disciplina. Tre cose da ricordare:

1. **Testa come un utente**: usa React Testing Library e query accessibili.
2. **Mock al confine**: usa MSW invece di mock manuali profondi.
3. **Piramide bilanciata**: molti unit, alcuni integration, pochi e2e critici.
