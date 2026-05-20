import { toast } from "sonner";

export const appToast = {
  agregadoCarrito: (nombre: string) =>
    toast.success("Agregado al carrito", { description: nombre }),
  eliminadoCarrito: () => toast("Producto eliminado del carrito"),
  favoritoAgregado: () => toast.success("Guardado en favoritos"),
  favoritoQuitado: () => toast("Eliminado de favoritos"),
  error: (msg: string) => toast.error(msg),
  perfilGuardado: () => toast.success("Perfil actualizado"),
  success: (msg: string) => toast.success(msg),
};
