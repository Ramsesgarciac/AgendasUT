import { Nota } from './nota';

export interface TipoActividad {
    id: number;
    nombre: string;
    notas: Nota[];
}