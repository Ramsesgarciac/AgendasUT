import { Actividad } from './actividad';

export interface Documento {
  id: number;
  nombre: string;
  tipoDoc: string;
  archivo: Buffer | null;
  actividad: Actividad;
}