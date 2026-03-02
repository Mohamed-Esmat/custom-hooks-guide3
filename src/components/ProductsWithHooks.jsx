import ProductCard from "./ProductCard.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { useFetch } from "../hooks/useFetch.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import { useToggle } from "../hooks/useToggle.js";

const API = "https://dummyjson.com/products?limit=100";

export default function ProductsWithHooks() {
  const [search, setSearch] = useLocalStorage("search_hooks", "");
  const debounced = useDebounce(search, 400);
  const [grid, toggleGrid] = useToggle(true);

  const { data, loading, error } = useFetch(API);
  const products = data?.products ?? [];

  const filtered = products.filter((p) => {
    const q = debounced.trim().toLowerCase();
    if (!q) return true;
    return [p.title, p.category, p.brand].some((s) =>
      String(s).toLowerCase().includes(q)
    );
  });

  const view = grid ? "grid" : "list";

  return (
    <section>
      <header className="toolbar">
        <h2>Products (With Hooks)</h2>
        <div className="controls">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, category..."
            className="input"
          />
          <div className="segmented">
            <button
              className={grid ? "active" : ""}
              onClick={() => !grid && toggleGrid()}
            >
              Grid
            </button>
            <button
              className={!grid ? "active" : ""}
              onClick={() => grid && toggleGrid()}
            >
              List
            </button>
          </div>
        </div>
      </header>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{String(error.message || error)}</p>}

      <p className="muted small">
        Showing {filtered.length} of {products.length} items
      </p>

      <div className={`grid ${view}`}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} view={view} />
        ))}
      </div>
    </section>
  );
}
