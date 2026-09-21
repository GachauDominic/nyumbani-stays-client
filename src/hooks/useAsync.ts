import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../api/client";

function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

/**
 * Runs `fetcher` whenever `deps` change and exposes loading/error/data state
 * plus a `reload` function for manual refreshes after a mutation.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cancel = reload();
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  return { data, setData, loading, error, reload };
}

/**
 * Wraps a mutation (create/update/delete) with pending/error state so pages
 * don't have to repeat the same try/catch/finally boilerplate.
 */
export function useAsyncAction<Args extends unknown[], R>(action: (...args: Args) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args: Args): Promise<R | undefined> => {
    setPending(true);
    setError(null);
    try {
      const result = await actionRef.current(...args);
      return result;
    } catch (err) {
      setError(extractErrorMessage(err));
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error, setError };
}
