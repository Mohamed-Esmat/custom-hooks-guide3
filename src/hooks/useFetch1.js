import { useEffect, useState } from "react";

function useFetch1(API) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed and failed: ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) setData(data.products || []);
      } catch (error) {
        if (!cancelled && error?.name !== "AbortError") setError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [API]);

  return { data, loading, error };
}

export default useFetch1;
