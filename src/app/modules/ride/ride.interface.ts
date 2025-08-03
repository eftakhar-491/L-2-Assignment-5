export enum RideStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
export interface IPickupAndDropoffLocation {
  address: string;
  latitude?: string;
  longitude?: string;
  boundingbox?: string[];
}

export interface IRide {
  _id?: string;
  rider: string;
  driver?: string;
  pickupLocation: IPickupAndDropoffLocation;
  dropoffLocation: IPickupAndDropoffLocation;
  status: RideStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
