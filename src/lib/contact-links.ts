/** Solo dígitos; para México agrega 52 si hay 10 dígitos locales. */
export function normalizarTelefonoMx(telefono: string): string | null {
  const digits = telefono.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.length === 10) return `52${digits}`;
  if (digits.startsWith("52") && digits.length >= 12) return digits;
  if (digits.length > 10) return digits;
  return null;
}

export function urlWhatsApp(telefono: string, mensaje: string): string | null {
  const mx = normalizarTelefonoMx(telefono);
  if (!mx) return null;
  return `https://wa.me/${mx}?text=${encodeURIComponent(mensaje)}`;
}

export function urlGoogleMapsNavegacion(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function urlGoogleMapsBusqueda(direccion: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

export function urlGoogleMapsDestino(
  lat: number | null,
  lng: number | null,
  direccion: string,
): string {
  if (lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) {
    return urlGoogleMapsNavegacion(lat, lng);
  }
  return urlGoogleMapsBusqueda(direccion);
}

export function mensajeWhatsAppEnCamino(nombre: string, pedidoId: number): string {
  return `Hola ${nombre}, soy tu repartidor de Plaza Mayoreo del Celular. Voy en camino con tu pedido #${pedidoId}. 📦`;
}

export function mensajeWhatsAppEntregado(pedidoId: number): string {
  return `¡Tu pedido #${pedidoId} fue entregado! Gracias por tu compra en Plaza Mayoreo del Celular 🎉`;
}

export function mensajeClienteARepartidor(nombre: string, pedidoId: number): string {
  return `Hola, soy ${nombre}. Tengo el pedido #${pedidoId} y quería confirmar el estatus de mi entrega.`;
}
