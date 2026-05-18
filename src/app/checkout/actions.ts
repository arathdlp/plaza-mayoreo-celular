"use server";

import {
  enviarEmailConfirmacionPedido,
  enviarEmailNuevoPedidoAdmin,
} from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export type LineaPedidoInput = {
  productoId: number;
  cantidad: number;
};

export type CrearPedidoInput = {
  nombre: string;
  email: string;
  telefono: string;
  direccionEntrega: string;
  metodoPago: "mercado_pago" | "contra_entrega";
  lineas: LineaPedidoInput[];
};

export type CrearPedidoResult =
  | { ok: true; pedidoId: number }
  | { ok: false; error: string; code?: "NO_AUTH" | "EMPTY_CART" | "INVALID_LINES" };

export async function crearPedido(input: CrearPedidoInput): Promise<CrearPedidoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Debes iniciar sesión para confirmar tu pedido.", code: "NO_AUTH" };
  }

  if (!input.lineas?.length) {
    return { ok: false, error: "El carrito está vacío.", code: "EMPTY_CART" };
  }

  const validated: {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
  }[] = [];

  let total = 0;

  for (const line of input.lineas) {
    if (!Number.isFinite(line.productoId) || line.productoId <= 0 || !Number.isFinite(line.cantidad) || line.cantidad < 1) {
      return { ok: false, error: "Datos de productos inválidos.", code: "INVALID_LINES" };
    }

    const { data: prod, error } = await supabase
      .from("productos")
      .select("id, nombre, precio, activo")
      .eq("id", line.productoId)
      .eq("activo", true)
      .maybeSingle();

    if (error || !prod) {
      return {
        ok: false,
        error: `El producto ${line.productoId} no está disponible.`,
        code: "INVALID_LINES",
      };
    }

    const precio = typeof prod.precio === "string" ? parseFloat(prod.precio) : Number(prod.precio);
    if (!Number.isFinite(precio) || precio < 0) {
      return { ok: false, error: "Precio inválido en catálogo.", code: "INVALID_LINES" };
    }

    validated.push({
      productoId: prod.id as number,
      nombre: (prod.nombre as string)?.trim() || `Producto #${prod.id}`,
      cantidad: Math.floor(line.cantidad),
      precio_unitario: precio,
    });
    total += precio * Math.floor(line.cantidad);
  }

  const { error: upsertErr } = await supabase.from("clientes").upsert(
    {
      id: user.id,
      nombre: input.nombre.trim(),
      email: input.email.trim(),
      telefono: input.telefono.trim(),
      direccion: input.direccionEntrega.trim(),
    },
    { onConflict: "id" },
  );

  if (upsertErr) {
    console.error("[crearPedido] clientes", upsertErr.message);
    return { ok: false, error: "No se pudo guardar tus datos de contacto." };
  }

  const { data: pedido, error: pedidoErr } = await supabase
    .from("pedidos")
    .insert({
      cliente_id: user.id,
      total,
      estado: "pendiente",
      direccion_entrega: input.direccionEntrega.trim(),
      metodo_pago: input.metodoPago,
      estado_pago: input.metodoPago === "mercado_pago" ? "pendiente" : null,
    })
    .select("id")
    .single();

  if (pedidoErr || !pedido?.id) {
    console.error("[crearPedido] pedidos", pedidoErr?.message);
    return {
      ok: false,
      error:
        pedidoErr?.message?.includes("metodo_pago") || pedidoErr?.message?.includes("column")
          ? "Ejecuta la migración SQL en Supabase (columna metodo_pago en pedidos)."
          : "No se pudo crear el pedido.",
    };
  }

  const pedidoId = pedido.id as number;

  const items = validated.map((v) => ({
    pedido_id: pedidoId,
    producto_id: v.productoId,
    cantidad: v.cantidad,
    precio_unitario: v.precio_unitario,
  }));

  const { error: itemsErr } = await supabase.from("pedido_items").insert(items);

  if (itemsErr) {
    console.error("[crearPedido] pedido_items", itemsErr.message);
    await supabase.from("pedidos").delete().eq("id", pedidoId);
    return { ok: false, error: "No se pudieron guardar los productos del pedido." };
  }

  try {
    const emailPedido = {
      id: pedidoId,
      total,
      metodo_pago: input.metodoPago,
      direccion_entrega: input.direccionEntrega.trim(),
    };
    const emailItems = validated.map((v) => ({
      nombre: v.nombre,
      cantidad: v.cantidad,
      precio_unitario: v.precio_unitario,
    }));
    const emailCliente = {
      nombre: input.nombre.trim(),
      email: input.email.trim(),
      telefono: input.telefono.trim(),
    };

    await Promise.all([
      enviarEmailConfirmacionPedido(emailPedido, emailItems, emailCliente),
      enviarEmailNuevoPedidoAdmin(emailPedido, emailItems, emailCliente),
    ]);
  } catch {
    /* el pedido ya fue creado; no bloquear por fallo de email */
  }

  return { ok: true, pedidoId };
}
