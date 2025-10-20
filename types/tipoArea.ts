export interface TipoArea {
  id: number;
  nombre: string;
  areas: Area[];
}

export interface Area {
  id: number;
  name: string;
  activities: Activity[];
  color: "primary" | "secondary" | "accent" | "chart-4" | "chart-5";
}

export interface Activity {
  id: string;
  subject: string;
  date: string;
}