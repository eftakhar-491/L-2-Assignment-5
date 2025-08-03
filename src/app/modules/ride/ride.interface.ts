export enum RideStatus {
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  COMPLETED = "COMPLETED",
}

export interface IRide {
  _id?: string;
  user: string; // User ID
  driver: string; // Driver ID
  pickupLocation: string;
  dropoffLocation: string;
  status: RideStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
