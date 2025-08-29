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
  isDeleted?: boolean;
  otp?: number;
  fee: number;
  isRideOTPVerified?: boolean;
  isRideAccepted?: boolean;
}

export interface IRideHistory {
  _id?: string;
  rideId: string;
  updatedBy?: string;

  isRideAccepted?: boolean;
  status: RideStatus;
  updatedTimestamp: Date;
  fee?: number;
  otp?: number;
  isRideOTPVerified?: boolean;
  pickupLocation: IPickupAndDropoffLocation;
  dropoffLocation: IPickupAndDropoffLocation;
}
