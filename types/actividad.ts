import { Area } from './area';

export interface Usuario {
  id: number;
  // Add other fields as needed
}

export interface Status {
  id: number;
  // Add other fields as needed
}

export interface Documentos {
  id: number;
  // Add other fields as needed
}

export interface Comentarios {
  id: number;
  // Add other fields as needed
}

export interface ColeccionComentarios {
  id: number;
  // Add other fields as needed
}

export interface Actividad {
  id: number;
  asunto: string;
  instanciaReceptora: string;
  instanciaEmisora: string;
  tipoActividad: string;
  fechaLimite: Date;
  fechaCreacion: Date;
  area: Area;
  userCreate: Usuario;
  status: Status;
  documentos: Documentos[];
  comentarios: Comentarios[];
  coleccionComentarios: ColeccionComentarios[];
}