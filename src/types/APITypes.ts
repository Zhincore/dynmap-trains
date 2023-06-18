export interface BlocksResponse {
  blocks: TrackBlock[];
}

export interface TrainsResponse {
  trains: Train[];
}

export interface TrackBlock {
  id: string;
  occupied: boolean;
  reserved: boolean;
  segments: TrackSegment[];
}

export interface Train {
  id: string;
  name: string;
  owner: null;
  cars: TrainCar[];
  backwards: boolean;
  stopped: boolean;
}

export interface TrainCar {
  id: number;
  leading: TrainLocation;
  trailing: TrainLocation;
}

export interface TrackSegment {
  dimension: string;
  path: TrainPoint[];
}

export interface TrainLocation {
  dimension: string;
  location: TrainPoint;
}

export interface TrainPoint {
  x: number;
  y: number;
  z: number;
}
