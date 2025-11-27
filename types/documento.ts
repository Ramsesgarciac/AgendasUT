import { Actividad } from './actividad';

export interface Documento {
  id: number;
  nombre: string;
  tipoDoc: string;
  archivo?: Buffer | null;
  actividad?: Actividad;
  isAcuce: boolean;
  usuarioId: number;
  entregaId?: number;
}

export interface DocumentForm {
  nombre: string;
  tipoDoc: string;
  file: File | null;
  entregaId: number;
  usuarioId: number;
}