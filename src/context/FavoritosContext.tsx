"use client";

import {
  deleteFavoritoRemote,
  insertFavoritoRemote,
  mergeFavoritosWithSupabase,
} from "@/lib/favoritos-db";
import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "plaza-mayoreo-favoritos-v1";

type FavoritosContextValue = {
  ids: number[];
  total: number;
  listo: boolean;
  sincronizando: boolean;
  esFavorito: (productoId: number) => boolean;
  toggle: (productoId: number) => Promise<void>;
  quitar: (productoId: number) => Promise<void>;
};

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

function leerStorage(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is number => typeof id === "number" && id > 0))];
  } catch {
    return [];
  }
}

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [listo, setListo] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const idsRef = useRef(ids);
  idsRef.current = ids;
  const syncingRef = useRef(false);

  useEffect(() => {
    setIds(leerStorage());
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo || typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore quota */
    }
  }, [ids, listo]);

  const syncWithSupabase = useCallback(async (userId: string) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSincronizando(true);
    try {
      const merged = await mergeFavoritosWithSupabase(userId, idsRef.current);
      setIds(merged);
    } finally {
      syncingRef.current = false;
      setSincronizando(false);
    }
  }, []);

  useEffect(() => {
    if (!listo) return;

    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        void syncWithSupabase(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && event === "SIGNED_IN") {
        void syncWithSupabase(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [listo, syncWithSupabase]);

  const persistRemote = useCallback(
    async (productoId: number, adding: boolean) => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return true;

      if (adding) {
        return insertFavoritoRemote(session.user.id, productoId);
      }
      return deleteFavoritoRemote(session.user.id, productoId);
    },
    [],
  );

  const toggle = useCallback(
    async (productoId: number) => {
      const exists = idsRef.current.includes(productoId);
      const adding = !exists;

      setIds((prev) => {
        if (exists) {
          return prev.filter((id) => id !== productoId);
        }
        return [...prev, productoId];
      });

      const ok = await persistRemote(productoId, adding);
      if (!ok) {
        setIds((prev) => {
          if (adding) {
            return prev.filter((id) => id !== productoId);
          }
          return prev.includes(productoId) ? prev : [...prev, productoId];
        });
      }
    },
    [persistRemote],
  );

  const quitar = useCallback(
    async (productoId: number) => {
      if (!idsRef.current.includes(productoId)) return;
      await toggle(productoId);
    },
    [toggle],
  );

  const esFavorito = useCallback(
    (productoId: number) => ids.includes(productoId),
    [ids],
  );

  const total = ids.length;

  const value = useMemo<FavoritosContextValue>(
    () => ({
      ids,
      total,
      listo,
      sincronizando,
      esFavorito,
      toggle,
      quitar,
    }),
    [ids, total, listo, sincronizando, esFavorito, toggle, quitar],
  );

  return (
    <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>
  );
}

export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) {
    throw new Error("useFavoritos debe usarse dentro de FavoritosProvider");
  }
  return ctx;
}
