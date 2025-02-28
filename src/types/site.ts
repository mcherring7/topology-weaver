
export interface Coordinates {
  x: number;
  y: number;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  connectionType: string;
  bandwidth: string;
  coordinates: Coordinates;
}
