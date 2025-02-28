
export interface Coordinates {
  x: number;
  y: number;
}

export interface Connection {
  type: string;
  bandwidth: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  connections: Connection[];
  coordinates: Coordinates;
}
