import { Status } from './status';

export interface Activity {
  id: string;
  subject: string;
  date: string;
  status: Status;
}

export interface TipoArea {
  id: number;
  nombre: string;
}

export interface Area {
  id: number;
  name: string;
  activities: Activity[];
  color: "primary" | "secondary" | "accent" | "chart-4" | "chart-5";
  tipoArea: TipoArea;
}