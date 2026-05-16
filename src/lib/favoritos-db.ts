import { createClient } from "@/lib/supabase/client";

export async function fetchFavoritoIdsForUser(userId: string): Promise<number[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("favoritos")
    .select("producto_id")
    .eq("cliente_id", userId);

  if (error) {
    console.error("[favoritos] fetch", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => row.producto_id)
    .filter((id): id is number => typeof id === "number" && id > 0);
}

/** Une local + remoto y sube los IDs locales que falten en Supabase. */
export async function mergeFavoritosWithSupabase(
  userId: string,
  localIds: number[],
): Promise<number[]> {
  const remoteIds = await fetchFavoritoIdsForUser(userId);
  const merged = [...new Set([...localIds, ...remoteIds])];
  const toInsert = localIds.filter((id) => !remoteIds.includes(id));

  if (toInsert.length === 0) {
    return merged;
  }

  const supabase = createClient();
  const { error } = await supabase.from("favoritos").upsert(
    toInsert.map((producto_id) => ({ cliente_id: userId, producto_id })),
    { onConflict: "cliente_id,producto_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("[favoritos] merge upsert", error.message);
    return merged;
  }

  return merged;
}

export async function insertFavoritoRemote(
  userId: string,
  productoId: number,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("favoritos")
    .upsert(
      { cliente_id: userId, producto_id: productoId },
      { onConflict: "cliente_id,producto_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("[favoritos] insert", error.message);
    return false;
  }
  return true;
}

export async function deleteFavoritoRemote(
  userId: string,
  productoId: number,
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from("favoritos")
    .delete()
    .eq("cliente_id", userId)
    .eq("producto_id", productoId);

  if (error) {
    console.error("[favoritos] delete", error.message);
    return false;
  }
  return true;
}
