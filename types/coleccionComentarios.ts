import { Actividad } from './actividad';
import { Comentario } from './comentario';

export interface ColeccionComentarios {
    id: number;
    fechaCreacion: Date;
    actividad: Actividad;
    comentarios: Comentario[];
}