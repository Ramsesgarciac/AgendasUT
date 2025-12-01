import { Actividad } from './actividad';

export interface Documento {
  id: number;
  nombre: string;
  tipoDoc: string;
  archivo?: Buffer | null;
  actividad?: Actividad;
  idActividades?: number;
  isAcuce: boolean;
  usuario?: { id: number };
  usuarioId?: number; // Keep for backward compatibility
  entregaId?: number;
}

export interface DocumentForm {
  nombre: string;
  tipoDoc: string;
  file: File | null;
  entregaId: number;
  usuarioId: number;
}