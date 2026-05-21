# Routage en React

> Navigation côté client avec React Router

---

## 1. Routing Paradigms and Architecture

### Routage en SPA

Dans une Single Page Application, le routage est géré côté client : l'URL change mais la page n'est pas rechargée. React Router intercepte la navigation et rend le composant associé à l'URL.

```mermaid
graph TD
    A["L'utilisateur clique sur un lien"] --> B["Le routeur intercepte"]
    B --> C["Mise à jour de l'historique du navigateur"]
    B --> D["Correspondance du motif de route"]
    D --> E["Rendu du composant"]

    C --> F["L'URL change"]
    F --> G["Pas de rechargement de page"]

    H["Navigation traditionnelle"] --> I["Requête serveur"]
    I --> J["Rechargement complet de la page"]
    J --> K["État perdu"]

    style A fill:#4dabf7
    style E fill:#51cf66
    style H fill:#ff6b6b
    style K fill:#ff6b6b
```

---

## 2. React Router Fundamentals

### Installation

```bash
npm install react-router-dom
```

### Configuration de base

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/about">À propos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 3. Route Configuration and Navigation

### `<Link>` vs `<NavLink>`

- `<Link>` : navigation simple sans rechargement.
- `<NavLink>` : comme `Link` mais ajoute une classe `active` quand l'URL correspond.

```tsx
<NavLink to="/profil" className={({ isActive }) => isActive ? 'actif' : ''}>
  Profil
</NavLink>
```

### Navigation API

`useNavigate()` pour naviguer par programme, `useLocation()` pour lire l'URL courante.

---

## 4. Dynamic Routing with Parameters

### Comment l'appariement de motif produit un objet params

Quand le routeur voit une URL comme `/users/42`, il parcourt les routes enregistrées et compare chaque motif segment par segment. Les jetons commençant par `:` sont capturés dans l'objet `params` que `useParams` retourne.

```mermaid
flowchart LR
    A["URL : /users/42/posts/9"] --> B["Motif de route : /users/:userId/posts/:postId"]
    B --> C["Appariement des segments"]
    C --> D["Extraction de :userId = 42"]
    C --> E["Extraction de :postId = 9"]
    D --> F["Objet params"]
    E --> F
    F --> G["useParams retourne { userId, postId }"]

    style A fill:#4dabf7
    style F fill:#ffd43b
    style G fill:#51cf66
```

### Paramètres URL

```tsx
<Route path="/utilisateurs/:id" element={<Utilisateur />} />

function Utilisateur() {
  const { id } = useParams();
  return <div>ID : {id}</div>;
}
```

### Query string

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const filtre = searchParams.get('filtre');
```

---

## 5. Nested Routes and Layouts

### Arborescence des routes imbriquées

Les routes imbriquées forment un arbre : un layout parent expose un `Outlet` dans lequel les routes enfants sont rendues. Cela permet de partager des en-têtes, des barres latérales et un contexte sans dupliquer la structure.

```mermaid
graph TD
    A["App"] --> B["Layout"]
    B --> C["Outlet"]

    C --> D["Route Dashboard"]
    C --> E["Route Profil"]
    C --> F["Route Paramètres"]

    D --> G["Contenu du tableau de bord"]
    E --> H["Contenu du profil"]
    F --> I["Routes imbriquées de Paramètres"]

    I --> J["Paramètres du compte"]
    I --> K["Paramètres de confidentialité"]

    style B fill:#4dabf7
    style C fill:#ffd43b
    style I fill:#51cf66
```

### Layout avec Outlet

```tsx
function Layout() {
  return (
    <div>
      <Header />
      <Outlet /> {/* les routes enfants sont rendues ici */}
    </div>
  );
}

<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Route>
</Routes>
```

### Routes imbriquées

```tsx
<Route path="/dashboard" element={<Dashboard />}>
  <Route index element={<Apercu />} />
  <Route path="reglages" element={<Reglages />} />
</Route>
```

---

## 6. Protected Routes and Authentication

### L'arbre de décision de la protection

Une route protégée exécute un petit arbre de décision à chaque rendu : la vérification d'authentification est-elle encore en cours, l'utilisateur est-il authentifié, possède-t-il le rôle requis ? Le diagramme ci-dessous montre les branches et où chacune se termine.

```mermaid
flowchart TD
    A["L'utilisateur navigue vers /dashboard"] --> B{"État d'auth chargé ?"}
    B -->|Non| C["Afficher LoadingSpinner"]
    B -->|Oui| D{"isAuthenticated ?"}
    D -->|Non| E["Navigate vers /login, conserver l'emplacement d'origine"]
    D -->|Oui| F{"Rôle requis ?"}
    F -->|Non| G["Rendu de l'Outlet — page protégée"]
    F -->|Oui| H{"L'utilisateur a-t-il le rôle ?"}
    H -->|Oui| G
    H -->|Non| I["Navigate vers /unauthorized"]

    style C fill:#ffd43b
    style E fill:#ff6b6b
    style G fill:#51cf66
    style I fill:#ff6b6b
```

### Wrapper de protection

```tsx
function Protegee({ children }: { children: ReactNode }) {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

<Route
  path="/dashboard"
  element={<Protegee><Dashboard /></Protegee>}
/>
```

### Redirection après login

Conservez la location d'origine et redirigez après authentification :

```tsx
const location = useLocation();
<Navigate to="/login" state={{ from: location }} replace />;
```

---

## 7. Programmatic Navigation

### Comment `useNavigate` déclenche un nouveau rendu

Appeler `navigate('/profile')` n'est pas un rendu direct — cela empile une entrée dans l'historique du navigateur, ce qui déclenche un nouveau matching de l'URL par le routeur et le rendu du nouveau sous-arbre de composants.

```mermaid
sequenceDiagram
    participant C as Composant
    participant N as useNavigate
    participant H as API History
    participant R as Routeur
    participant V as Vue

    C->>N: navigate('/profile')
    N->>H: history.pushState(...)
    H-->>R: popstate / changement de location
    R->>R: Appariement de la nouvelle URL avec les routes
    R->>V: Démontage de l'ancienne route, montage de Profile
    V-->>C: Arbre mis à jour rendu
```

### useNavigate

```tsx
const navigate = useNavigate();
navigate('/profil');              // push
navigate('/profil', { replace: true });
navigate(-1);                       // retour
navigate('/profil', { state: { de: 'admin' } });
```

### Bloquer la navigation

Pour des formulaires non sauvegardés : utilisez `useBlocker` (React Router v6.4+) ou un `onBeforeUnload` pour la fermeture de l'onglet.

---

## 8. Route Guards and Redirects

### Pattern typique

Il n'existe pas d'API dédiée aux guards dans React Router : on utilise un composant wrapper ou un layout protégé.

```tsx
function GuardAdmin({ children }) {
  const { role } = useAuth();
  if (role !== 'admin') return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}
```

### Loader (Data API)

Avec React Router v6.4+, vous pouvez charger les données avant la navigation grâce à `loader`, évitant les « flashs » d'état vide :

```tsx
const router = createBrowserRouter([
  {
    path: '/utilisateurs/:id',
    element: <Utilisateur />,
    loader: ({ params }) => fetch(`/api/utilisateurs/${params.id}`).then(r => r.json()),
  },
]);
```

---

## 9. Advanced Routing Patterns

### Lazy loading

```tsx
const Dashboard = lazy(() => import('./Dashboard'));

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Chargement />}>
      <Dashboard />
    </Suspense>
  }
/>
```

### Patterns d'URL

- `/utilisateurs?page=2` pour les filtres.
- `/utilisateurs/123/posts/456` pour les hiérarchies.
- Modales comme état dans l'URL (`?modale=confirmer`) pour des liens partageables.

---

## 10. Performance Optimization

### Bonnes pratiques

1. **Code splitting par route** avec `React.lazy()`.
2. **Prefetch** des chunks des routes probables.
3. **Loaders** pour éviter les chargements séquentiels.
4. **Mémoïser** les composants coûteux qui persistent entre navigations (`<Outlet />` conserve les ancêtres).

---

## Conclusion: Mastering Navigation Architecture

### Synthèse

```mermaid
graph TD
    A["Maîtrise du routage"] --> B["Fondamentaux"]
    A --> C["Patterns avancés"]
    A --> D["Performance"]

    B --> B1["Configuration des routes"]
    B --> B2["Navigation"]
    B --> B3["Paramètres"]

    C --> C1["Routes imbriquées"]
    C --> C2["Routes protégées"]
    C --> C3["Lazy loading"]

    D --> D1["Code splitting"]
    D --> D2["Prefetching"]
    D --> D3["Monitoring"]

    style A fill:#845ef7
    style B fill:#4dabf7
    style C fill:#51cf66
    style D fill:#ffd43b
```

### Conclusion

React Router est léger et composable. Les routes sont des **composants**, pas des configurations statiques, vous pouvez donc les composer librement. Trois choses à retenir :

1. **Layout via `<Outlet />`** plutôt que dupliquer la structure.
2. **Protection via wrapper**, pas de guards implicites.
3. **Code splitting** et **loaders** pour une UX fluide et rapide.
