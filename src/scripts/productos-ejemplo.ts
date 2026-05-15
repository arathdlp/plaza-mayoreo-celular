export type ProductoImport = {
  nombre: string;
  marca: string;
  modelo: string;
  categoria: "Pantalla" | "Bateria" | "Tapa Trasera" | "Placa de Carga" | "Accesorio" | "Celular";
  costo: number;
  precio: number;
};

/** Primeros 20 productos de ejemplo (5 por categoría). */
export const productosEjemplo: ProductoImport[] = [
  // Pantalla
  {
    nombre: "Pantalla OLED iPhone 13",
    marca: "Apple",
    modelo: "iPhone 13",
    categoria: "Pantalla",
    costo: 1450,
    precio: 1899,
  },
  {
    nombre: "Pantalla LCD Samsung Galaxy A54",
    marca: "Samsung",
    modelo: "Galaxy A54",
    categoria: "Pantalla",
    costo: 1180,
    precio: 1650,
  },
  {
    nombre: "Pantalla AMOLED Xiaomi Redmi Note 12",
    marca: "Xiaomi",
    modelo: "Redmi Note 12",
    categoria: "Pantalla",
    costo: 890,
    precio: 1290,
  },
  {
    nombre: "Pantalla LCD Motorola Moto G84",
    marca: "Motorola",
    modelo: "Moto G84",
    categoria: "Pantalla",
    costo: 1020,
    precio: 1420,
  },
  {
    nombre: "Pantalla Incell Huawei P30 Lite",
    marca: "Huawei",
    modelo: "P30 Lite",
    categoria: "Pantalla",
    costo: 680,
    precio: 990,
  },
  // Bateria
  {
    nombre: "Batería original iPhone 12",
    marca: "Apple",
    modelo: "iPhone 12",
    categoria: "Bateria",
    costo: 320,
    precio: 459,
  },
  {
    nombre: "Batería Samsung Galaxy S21",
    marca: "Samsung",
    modelo: "Galaxy S21",
    categoria: "Bateria",
    costo: 280,
    precio: 399,
  },
  {
    nombre: "Batería Xiaomi Redmi Note 11",
    marca: "Xiaomi",
    modelo: "Redmi Note 11",
    categoria: "Bateria",
    costo: 210,
    precio: 329,
  },
  {
    nombre: "Batería Motorola Moto G52",
    marca: "Motorola",
    modelo: "Moto G52",
    categoria: "Bateria",
    costo: 195,
    precio: 289,
  },
  {
    nombre: "Batería OPPO A54",
    marca: "OPPO",
    modelo: "A54",
    categoria: "Bateria",
    costo: 175,
    precio: 269,
  },
  // Tapa Trasera
  {
    nombre: "Tapa trasera iPhone XR",
    marca: "Apple",
    modelo: "iPhone XR",
    categoria: "Tapa Trasera",
    costo: 180,
    precio: 299,
  },
  {
    nombre: "Tapa trasera Samsung Galaxy A32",
    marca: "Samsung",
    modelo: "Galaxy A32",
    categoria: "Tapa Trasera",
    costo: 120,
    precio: 219,
  },
  {
    nombre: "Tapa trasera Xiaomi Redmi 9",
    marca: "Xiaomi",
    modelo: "Redmi 9",
    categoria: "Tapa Trasera",
    costo: 95,
    precio: 169,
  },
  {
    nombre: "Tapa trasera Huawei Y9 2019",
    marca: "Huawei",
    modelo: "Y9 2019",
    categoria: "Tapa Trasera",
    costo: 110,
    precio: 189,
  },
  {
    nombre: "Tapa trasera Motorola Edge 30",
    marca: "Motorola",
    modelo: "Edge 30",
    categoria: "Tapa Trasera",
    costo: 140,
    precio: 249,
  },
  // Placa de Carga
  {
    nombre: "Placa de carga iPhone 11",
    marca: "Apple",
    modelo: "iPhone 11",
    categoria: "Placa de Carga",
    costo: 620,
    precio: 890,
  },
  {
    nombre: "Placa de carga Samsung Galaxy A51",
    marca: "Samsung",
    modelo: "Galaxy A51",
    categoria: "Placa de Carga",
    costo: 480,
    precio: 720,
  },
  {
    nombre: "Placa de carga Xiaomi Redmi Note 10",
    marca: "Xiaomi",
    modelo: "Redmi Note 10",
    categoria: "Placa de Carga",
    costo: 390,
    precio: 590,
  },
  {
    nombre: "Módulo de carga USB-C universal",
    marca: "Genérico",
    modelo: "Universal",
    categoria: "Placa de Carga",
    costo: 140,
    precio: 219,
  },
  {
    nombre: "Placa de carga Motorola Moto G60",
    marca: "Motorola",
    modelo: "Moto G60",
    categoria: "Placa de Carga",
    costo: 410,
    precio: 640,
  },
];
