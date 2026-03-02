import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import useFetch2 from "../hooks/useFetch2.js";
const API = "https://dummyjson.com/products?limit=100";

export default function ProductsVanilla() {
  const { data: products, loading, error } = useFetch2(API);

  const [search, setSearch] = useState(() => {
    try {
      return localStorage.getItem("search_vanilla") || "";
    } catch {
      return "";
    }
  }); // Lazy initialization. Could also do this in useEffect, but then there would be a flash of empty value.
  const [view, setView] = useState("grid"); // 'grid' | 'list'

  // Manual debounce for search
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Persist search without a hook
  useEffect(() => {
    try {
      localStorage.setItem("search_vanilla", search);
    } catch {
      // ignore
    }
  }, [search]);

  // useEffect(() => {
  //   async function fetchProducts() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch(API);
  //       if (!response.ok) {
  //         throw new Error(`Request failed: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       setProducts(data.products || []);
  //     } catch (error) {
  //       setError(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchProducts();
  //   return () => {};
  // }, []);

  // Fetch products without a hook
  // useEffect(() => {
  //   // let cancelled = false;
  //   // const controller = new AbortController();

  //   async function fetchProducts() {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       // const response = await fetch(API, { signal: controller.signal });
  //       const response = await fetch(API);
  //       if (!response.ok) {
  //         throw new Error(`Request failed: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       // if (!cancelled)
  //       setProducts(data.products || []);
  //     } catch (error) {
  //       // if (!cancelled && error?.name !== "AbortError")
  //       setError(error);
  //     } finally {
  //       // if (!cancelled)
  //       setLoading(false);
  //     }
  //   }
  //   fetchProducts();
  //   return () => {
  //     // cancelled = true;
  //     // controller.abort();
  //   };
  // }, []);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.category, p.brand].some((s) =>
        String(s).toLowerCase().includes(q),
      ),
    );
  }, [products, debounced]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error</p>;
  }

  return (
    <section>
      <header className="toolbar">
        <h2>Products (Vanilla)</h2>
        <div className="controls">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, brand, category..."
            className="input"
          />
          <div className="segmented">
            <button
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
            >
              Grid
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>
      </header>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error">{String(error.message || error)}</p>}

      <p className="muted small">
        {/* Showing {countRef.current} of {products.length} items */}
      </p>

      <div className={`grid ${view}`}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} view={view} />
        ))}
      </div>
    </section>
  );
}
