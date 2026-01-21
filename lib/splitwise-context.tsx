"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getSplitwiseData } from "@/app/actions";
import { useAuth } from "@/lib/auth-client";

const CACHE_KEY = "splitwise_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SplitwiseData {
  friends: any[];
  groups: any[];
  currentUser: any;
}

interface CachedData extends SplitwiseData {
  timestamp: number;
}

interface SplitwiseContextType {
  data: SplitwiseData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: (force?: boolean) => Promise<void>;
}

const SplitwiseContext = createContext<SplitwiseContextType | undefined>(
  undefined
);

function getFromCache(): CachedData | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedData;
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function saveToCache(data: SplitwiseData): void {
  if (typeof window === "undefined") return;

  try {
    const cacheData: CachedData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore storage errors
  }
}

// Initialize from cache synchronously
function getInitialData(): SplitwiseData | null {
  const cached = getFromCache();
  if (cached) {
    return {
      friends: cached.friends,
      groups: cached.groups,
      currentUser: cached.currentUser,
    };
  }
  return null;
}

export function SplitwiseProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<SplitwiseData | null>(getInitialData);
  const [isLoading, setIsLoading] = useState(!getInitialData());
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const refresh = useCallback(
    async (force = false) => {
      // Don't fetch if not authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check cache first unless forcing refresh
      if (!force) {
        const cached = getFromCache();
        if (cached) {
          setData({
            friends: cached.friends,
            groups: cached.groups,
            currentUser: cached.currentUser,
          });
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getSplitwiseData();
        if (result) {
          const newData: SplitwiseData = {
            friends: result.friends || [],
            groups: result.groups || [],
            currentUser: result.currentUser || null,
          };
          setData(newData);
          saveToCache(newData);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch data")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Fetch data when user becomes authenticated
  useEffect(() => {
    if (!authLoading && user && !hasFetched) {
      setHasFetched(true);
      refresh();
    }
  }, [authLoading, user, hasFetched, refresh]);

  // Clear data when user logs out
  useEffect(() => {
    if (!authLoading && !user) {
      setData(null);
      setIsLoading(false);
    }
  }, [authLoading, user]);

  const value = useMemo(
    () => ({ data, isLoading, error, refresh }),
    [data, isLoading, error, refresh]
  );

  return (
    <SplitwiseContext.Provider value={value}>
      {children}
    </SplitwiseContext.Provider>
  );
}

export function useSplitwiseContext() {
  const context = useContext(SplitwiseContext);
  if (context === undefined) {
    throw new Error(
      "useSplitwiseContext must be used within a SplitwiseProvider"
    );
  }
  return context;
}

export function clearSplitwiseCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
}
