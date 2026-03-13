export interface Society {
  id: string;
  name: string;
  area: string;
  ecoPoints: number;
  totalPickups: number;
  plasticCollected: number; // in kg
  cardboardCollected: number; // in kg
  co2Reduced: number; // in kg
  plasticSaved: number; // in kg
  lastPickupDate: Date;
}

export interface AreaWasteData {
  area: string;
  plastic: number;
  cardboard: number;
  total: number;
}

export interface RecyclingData {
  month: string;
  recycled: number;
  landfill: number;
}
