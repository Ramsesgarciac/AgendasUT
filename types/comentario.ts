import { Actividad } from './actividad';
import { Usuario } from './actividad';
import { ColeccionComentarios } from './actividad';

export interface Comentario {
    id: number;
    contenido: string;
    fechaCreacion: Date;
    actividad: Actividad;
    usuario: Usuario;
    coleccion?: ColeccionComentarios;
}