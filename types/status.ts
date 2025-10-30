export interface Status {
  id: number;
  nombre: string;
  actividades?: any[]; // Optional, as it's a relation
}