export type ProductoAdminRow = {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: string;
  precio: number;
  costo: number;
  activo: boolean;
  imagen_url: string | null;
  descripcion: string | null;
  stock: number | null;
};
