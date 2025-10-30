import { Area } from './area';
import { Actividad } from './actividad';
import { Nota } from './nota';
import { Comentario } from './comentario';

export interface Usuario {
    id: number;
    rol: string;
    email: string;
    contraseña: string;
    fechaCreacion: Date;
    areas: Area[];
    actividadesCreadas: Actividad[];
    notas: Nota[];
    comentarios: Comentario[];
}