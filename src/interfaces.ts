export type ModalidadEntrega =
  | "Domicilio"
  | "Oficina"
  | "Punto Pack"
  | "Locker"
  | "Recogida en almacén";

export type CanalOrigen = "Contrato" | "Contado";

export type DiaSemana =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export type Turno = "Mañana" | "Tarde" | "Noche";

// TODO - Nada seguro de esta interfaz
export interface DataRow {
  // Localización
  codigo_postal: string;
  unidad: string;
  area: string;
  provincia: string;

  // Producto
  producto: string;
  material: string;
  tipo_producto: string;

  // Cliente
  top_50_cliente: string | null;
  contrato: string | null;
  segmento_cliente: string;

  // Canal/Modalidad
  modalidad_entrega: ModalidadEntrega;
  canal_origen: CanalOrigen;
  entrega_use: boolean;

  // Temporal
  semana: string; // Formato: "2025-W31"
  dia: DiaSemana;
  turno: Turno;

  // Métrica
  volumen: number;
}
