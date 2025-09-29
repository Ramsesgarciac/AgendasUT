import { Area } from './area';

export interface Usuario {
  id: number;
  // Add other fields as needed
}

export interface TipoActividad {
  id: number;
  // Add other fields as needed
}

export interface Nota {
  id: number;
  nombre: string;
  nota: string;
  fechaCreacion: Date;
  userCreate: Usuario;
  area: Area;
  tiposActividad: TipoActividad[];
}