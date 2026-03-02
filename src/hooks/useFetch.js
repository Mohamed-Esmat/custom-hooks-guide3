import { useEffect, useState } from "react";

/**
 * Very simple fetch hook for beginners.
 * Only manages three pieces of state: data, loading, error.
 * Fetches once when the component mounts or when the url changes.
 *
 * @param {string|null} url - Endpoint to fetch (e.g. 'https://fakestoreapi.com/products')
 * @returns {{ data: any, loading: boolean, error: Error|null }}
 */
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

export default useFetch;
