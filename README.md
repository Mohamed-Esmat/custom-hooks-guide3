# The Complete Guide to React Custom Hooks

Your single, comprehensive reference for understanding, designing, testing, and mastering custom React hooks—tailored for beginners but deep enough for production use. This repo includes simple versions of commonly used hooks and a small app that contrasts “without hooks” vs “with hooks” so learners can see the real value.

- React: 19.x
- Tooling: Vite, ESLint with `eslint-plugin-react-hooks`

Examples in this project use plain JavaScript to keep the focus on React hooks. A TypeScript appendix shows how you’d add types when you’re ready.

---

## What are custom hooks?

Custom hooks are normal JavaScript functions that:

- Start with the name prefix `use...`.
- Call other hooks inside (like `useState`, `useEffect`, `useMemo`, etc.).
- Encapsulate reusable stateful logic that you can share across components.

Think of custom hooks as “logic components.” They don’t render UI. They package logic you’d otherwise repeat in multiple components.

Why they’re great:

- Reuse: Extract the “how” so UIs stay small and focused.
- Testability: Test logic separately from UI.
- Composition: Hooks can use hooks, building up more powerful tools.

Common use cases:

- Toggling booleans (`useToggle`)
- Persisting state to `localStorage` (`useLocalStorage`)
- Waiting until a value “settles” before acting (`useDebounce`)
- Fetching data (`useFetch`)
- Media queries, event listeners, forms, keyboard shortcuts, feature flags, etc.

---

## The Rules of Hooks (must-know)

1. Only call hooks at the top level of your function. Don’t call them in loops, conditions, or nested functions. This lets React preserve the order of hooks between renders.

2. Only call hooks from React functions:

- React components
- Custom hooks

3. Name your custom hook with the `use` prefix. This helps linters and other tools enforce the rules.

Linting: This project includes `eslint-plugin-react-hooks` which checks dependency arrays and usage. If it complains, it’s often saving you from subtle bugs.

---

## Anatomy of a good custom hook

Design your hooks like small APIs:

- Input: Parameters the hook receives.
- Output: A stable, simple shape (array or object) describing its “contract.”
- Behavior: What side effects it performs, when, and how it handles errors.
- Edge cases: Loading, empty, error, cancellation, cleanup.

Return shapes:

- Arrays for small, positional APIs: `[value, setValue]`, `[on, toggle]`.
- Objects for richer, named APIs: `{ data, loading, error, refetch }`.

Documentation tip: Add a short JSDoc above your hook describing inputs/outputs. Future you (and your students) will thank you.

---

## Beginner-friendly hooks in this repo

These versions are intentionally simple for teaching. They match what you’d write inline in a component but extracted into reusable hooks.

### 1) useToggle (super simple)

File: `src/hooks/useToggle.js`

```js
import { useState } from "react";

export function useToggle(initial = false) {
  const [value, setValue] = useState(Boolean(initial));
  const toggle = () => setValue((v) => !v);
  return [value, toggle, setValue];
}
```

Use it like:

```jsx
const [isOpen, toggleOpen] = useToggle();
// or get setValue too: const [isOpen, toggleOpen, setOpen] = useToggle(false)
```

Key ideas:

- Keep it tiny. Teach state and a simple updater.
- Arrays are great for small, positional APIs.

---

### 2) useLocalStorage (simple, JSON-based)

File: `src/hooks/useLocalStorage.js`

```js
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  }, [key, value]);

  return [value, setValue];
}
```

Notes:

- Works in the browser; if you later render on the server (SSR), guard against `window` being undefined.
- Stores JSON. Avoid storing complex/large objects.

---

### 3) useDebounce (delay value updates)

File: `src/hooks/useDebounce.js`

```js
import { useEffect, useState } from "react";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

Use it to avoid firing effects on every keystroke:

```jsx
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 300);
```

---

### 4) useFetch (beginner: effect + 3 states)

File: `src/hooks/useFetch.js`

```js
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!url) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

This is the simplest useful pattern for students:

- One `useEffect` that runs when `url` changes.
- Three pieces of state: `data`, `loading`, `error`.
- No refetch function, no AbortController—keep the mental model small.

When students are ready, expand it with a `refetch` function, request cancellation, and options (see Advanced Patterns below).

---

## Seeing the value: Without hooks vs With hooks

Here’s a teaching flow you can use in class:

1. Build a simple “Products search” component that fetches from a public API like Fake Store API (`https://fakestoreapi.com/products`). Do it first WITHOUT custom hooks: all state and effects live in the component.

2. Refactor into smaller hooks: `useFetch`, `useDebounce`, `useLocalStorage`, and a `useToggle` to show/hide filters. Show how the component shrinks and becomes easier to read.

Minimal “without hooks” sketch:

```jsx
function ProductsVanilla() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const json = await res.json();
        setProducts(json);
      } catch (e) {
        setError(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  // render UI...
}
```

Refactor “with hooks” sketch:

```jsx
function ProductsWithHooks() {
  const [query, setQuery] = useLocalStorage("query", "");
  const debounced = useDebounce(query, 300);
  const {
    data: products = [],
    loading,
    error,
  } = useFetch("https://fakestoreapi.com/products");

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(debounced.toLowerCase())
  );

  // render UI...
}
```

Teaching moments:

- Compare line counts and readability.
- Emphasize separation of concerns: each hook does one job.
- Show how easy it is to reuse the same hooks in new screens.

---

## Advanced patterns (after the basics land)

These are optional but important for production.

### A) Fetch with Abort + refetch

```js
import { useEffect, useRef, useState, useCallback } from "react";

export function useFetchAdvanced(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const run = useCallback(
    async (nextUrl = url) => {
      if (!nextUrl) return;
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(nextUrl, {
          ...options,
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") setError(e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [url, options]
  );

  useEffect(() => {
    run();
    return () => controllerRef.current?.abort();
  }, [run]);

  return { data, loading, error, refetch: run };
}
```

Why this matters:

- Cancels stale requests when `url` changes quickly.
- Exposes `refetch` for pull-to-refresh or retry buttons.

### B) Stabilizing values and avoiding re-renders

- Use `useCallback` for functions you return if consumers depend on referential equality.
- Use `useMemo` for derived values that are expensive to compute.
- But don’t prematurely optimize—teach the simple path first.

### C) SSR and environments

- Guard against `window`/`localStorage` when rendering on the server: check `typeof window !== 'undefined'`.
- Consider hydration differences; lazy-initialize state from storage inside `useEffect` if needed.

### D) Error handling and retries

- Provide consistent error shapes, e.g., `{ message, code }`.
- Consider adding a `retry` function to your hook.

### E) Composition patterns

- Hooks can use hooks: e.g., `useSearchProducts` can combine `useFetch` + `useDebounce` + `useLocalStorage`.
- Keep each hook focused; compose them in components or in higher-level hooks.

---

## Testing custom hooks

You test hooks by rendering a tiny test component that uses them, then asserting on the DOM or exposed values. With React Testing Library:

```jsx
// Example test idea (pseudo-code)
function Demo() {
  const [on, toggle] = useToggle(false);
  return (
    <div>
      <span>{on ? "ON" : "OFF"}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

// Render <Demo/>, click the button, expect text to change.
```

For async hooks like `useFetch`, use `await` with `waitFor` utilities and mock `fetch`.

Key points:

- You don’t test React internals; you test observable behavior.
- Keep tests close to real usage.

---

## Linting and the Hooks rules

This project includes `eslint-plugin-react-hooks` which enforces:

- Only call hooks in React functions.
- Dependency array correctness for `useEffect`, `useMemo`, `useCallback`.

If the linter says a dependency is missing, it’s usually right. When teaching, explain why a value belongs in the dependency array. If you intentionally exclude it, understand the stale-closure trade-off.

---

## TypeScript appendix (optional)

You can add TypeScript types to hooks as you grow. Example:

```ts
export function useToggle(
  initial: boolean = false
): [boolean, () => void, (next: boolean) => void] {
  const [value, setValue] = useState<boolean>(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle, setValue];
}
```

For `useLocalStorage<T>` you can make it generic: `function useLocalStorage<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>]`.

---

## How to run this project

Prereqs: Node 18+ recommended.

Development:

```bash
npm install
npm run dev
```

Build preview:

```bash
npm run build
npm run preview
```

Open the app and explore the hooks in `src/hooks/`. Try creating a simple component that uses each hook and observe how little code you need in your UI.

---

## Practice exercises for learners

1. Write `useCounter(initial, step)` that returns `{ count, inc, dec, reset }`.
2. Write `useEventListener(target, type, handler)` that adds/removes listeners safely.
3. Upgrade `useFetch` with a `refetch` function and an AbortController.
4. Add `sessionStorage` support to `useLocalStorage` as an option.
5. Build a `usePrevious(value)` hook and use it to animate changes.

When finished, compare your solutions with teammates and refactor for clarity. Remember: small APIs, clear contracts, and focused responsibilities.

---

## Further reading

- Official React docs: https://react.dev/learn/reusing-logic-with-custom-hooks
- Kent C. Dodds on hooks: https://kentcdodds.com/blog
- Epic React patterns: https://epicreact.dev (paid)

Happy hooking! If you have questions or want to extend these examples, open an issue or PR.

## Project structure

- src/hooks/
  - useFetch.js — fetch with abort, loading, error, and refetch
  - useDebounce.js — debounced value
  - useLocalStorage.js — state persisted in localStorage
  - useToggle.js — boolean toggle
- src/components/
  - ProductCard.jsx — presentational card
  - ProductsVanilla.jsx — no custom hooks
  - ProductsWithHooks.jsx — refactor using hooks
- src/App.jsx — simple tabs to switch versions
- src/index.css — minimal modern styling

## Run locally

Requirements: Node 18+

1. Install

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

Open the URL shown in your terminal and try searching products, switching views, and comparing the tabs.

## Next ideas

- Add pagination and extract usePagination
- Add error retries to useFetch
- Extract useQueryParam to sync search with the URL
