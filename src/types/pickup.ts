export type WasteType = 'plastic' | 'cardboard';

export type PickupStatus = 'requested' | 'scheduled' | 'picked' | 'recycled';

export interface PickupRequest {
  id: string;
  wasteType: WasteType;
  quantity: 'small' | 'medium' | 'large';
  status: PickupStatus;
  requestedAt: Date;
  scheduledTime?: Date;
  vehicleId?: string;
  estimatedArrival?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  currentLocation: { lat: number; lng: number };
  status: 'available' | 'en-route' | 'busy';
}
