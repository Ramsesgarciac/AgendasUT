export interface Activity {
  id: string;
  subject: string;
  date: string;
}

export interface Area {
  id: number;
  name: string;
  activities: Activity[];
  color: "primary" | "secondary" | "accent" | "chart-4" | "chart-5";
}