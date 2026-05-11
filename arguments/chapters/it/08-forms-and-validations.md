# Form e Validazione in React

> Gestione di form e validazione con e senza librerie

---

## 1. Form Management Paradigms

### Approcci

1. **Controllati con `useState`**: ogni campo è uno stato. Adatto a form piccoli.
2. **Non controllati con `useRef`**: leggi i valori solo all'invio. Più performante per form lunghi.
3. **Librerie dedicate**: React Hook Form, Formik. Gestiscono state, validazione, errori, performance.
4. **Schema validation**: Yup, Zod, Valibot. Definiscono lo schema dei dati e generano errori tipizzati.

### Quando Cosa

- 1–3 campi: `useState`.
- Form medi/grandi: React Hook Form + Zod.
- Form Wizard / multi-step: React Hook Form con `useFieldArray` o macchina a stati.

---

## 2. Controlled vs Uncontrolled Components

### Controllati

```tsx
const [nome, setNome] = useState('');
<input value={nome} onChange={(e) => setNome(e.target.value)} />
```

Vantaggio: validazione in tempo reale, valore prevedibile.
Svantaggio: ogni keystroke causa un render.

### Non Controllati

```tsx
const ref = useRef<HTMLInputElement>(null);
<input ref={ref} defaultValue="Mario" />
<button onClick={() => console.log(ref.current?.value)}>Invia</button>
```

Vantaggio: zero render fra le digitazioni.
Svantaggio: validazione live più complessa, valore non sempre disponibile.

---

## 3. React Hook Form: Modern Form Management

### Setup

```tsx
import { useForm } from 'react-hook-form';

type Datiform = { nome: string; email: string };

function FormContatto() {
  const { register, handleSubmit, formState: { errors } } = useForm<Datiform>();

  const invia = (dati: Datiform) => console.log(dati);

  return (
    <form onSubmit={handleSubmit(invia)}>
      <input {...register('nome', { required: 'Nome obbligatorio' })} />
      {errors.nome && <span>{errors.nome.message}</span>}

      <input {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} />
      {errors.email && <span>Email non valida</span>}

      <button type="submit">Invia</button>
    </form>
  );
}
```

### Perché Sceglierlo

- **Performance**: campi non controllati di default, niente render per ogni keystroke.
- **API minimale**: `register`, `handleSubmit`, `formState`.
- **Integrazione schema**: `@hookform/resolvers` per Yup/Zod.

---

## 4. Validation with Yup

### Schema

```tsx
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  nome: yup.string().required('Nome obbligatorio'),
  email: yup.string().email('Email non valida').required(),
  eta: yup.number().min(18, 'Deve essere maggiorenne').required(),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema),
});
```

### Quando Usarlo

Yup è maturo, semplice e diffuso. Per chi non vuole gestire validazione manuale.

---

## 5. Validation with Zod

### Schema Tipizzato

```tsx
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  nome: z.string().min(1, 'Nome obbligatorio'),
  email: z.string().email('Email non valida'),
  eta: z.number().int().min(18, 'Maggiorenne richiesto'),
});

type Datiform = z.infer<typeof schema>;

const { register, handleSubmit } = useForm<Datiform>({
  resolver: zodResolver(schema),
});
```

### Perché Zod

- Tipi TypeScript inferiti automaticamente dallo schema.
- Validazione runtime + tipi statici da un'unica fonte di verità.
- Ottimo per validare anche risposte API.

---

## 6. File Upload Handling

### Input File

```tsx
function Caricatore() {
  const [file, setFile] = useState<File | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const invia = async () => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    await fetch('/api/upload', { method: 'POST', body: form });
  };

  return (
    <>
      <input type="file" onChange={onChange} />
      <button onClick={invia} disabled={!file}>Carica</button>
    </>
  );
}
```

### Drag & Drop

Usa eventi `onDragOver`, `onDrop` e `event.dataTransfer.files`. Librerie come `react-dropzone` semplificano.

---

## 7. Multi-Step Forms

### Pattern

Memorizza lo step corrente, mantieni il dato accumulato:

```tsx
const [step, setStep] = useState(0);
const metodi = useForm<Datiform>({ defaultValues: stato });

const onAvanti = (data: Partial<Datiform>) => {
  setStato({ ...stato, ...data });
  setStep(s => s + 1);
};
```

### Con React Hook Form

Sfrutta `getValues()` e `setValue()` per leggere/scrivere campi senza re-render.

---

## 8. Form State Management

### Lo Stato di un Form

- **Valori** dei campi
- **Errori** di validazione
- **Touched/Dirty** (campi modificati)
- **isSubmitting**
- **isValid**

Librerie come React Hook Form li espongono tutti tramite `formState`.

### Pattern Comuni

- Disabilita "Invia" se `!isValid || isSubmitting`.
- Mostra errori solo sui campi `touched` per evitare rumore.
- Salva la bozza in `localStorage` per persistere fra ricariche.

---

## 9. Advanced Form Patterns

### Field Arrays

Per liste dinamiche di campi:

```tsx
const { fields, append, remove } = useFieldArray({ control, name: 'recapiti' });

fields.map((f, i) => (
  <div key={f.id}>
    <input {...register(`recapiti.${i}.email`)} />
    <button onClick={() => remove(i)}>Rimuovi</button>
  </div>
))
```

### Validazione Asincrona

Per controlli che dipendono dal server (es. username già usato):

```tsx
const schema = z.object({
  username: z.string().refine(async (val) => {
    const r = await fetch(`/api/check?u=${val}`);
    return (await r.json()).libero;
  }, 'Username già usato'),
});
```

---

## 10. Form Strategy Selection Matrix

### Quale Approccio?

| Form | Approccio Consigliato |
|------|------------------------|
| 1–3 campi | `useState` |
| 5–20 campi | React Hook Form + Zod |
| Multi-step | React Hook Form + macchina a stati |
| Upload file | RHF + `react-dropzone` |
| Validazione asincrona | Zod + `refine` |
| Editor in real-time | Stato controllato |

---

## Conclusion: Mastering Form Management

### Conclusione

I form sono ciò che fa funzionare la maggior parte delle applicazioni. Tre principi:

1. **Schema unico di verità** (Zod) per validare e tipizzare.
2. **Performance** non è un dettaglio: usa form non controllati per scale grandi.
3. **UX prima**: stato di submit, errori chiari, focus management, accessibilità con `aria-invalid` e label.
