import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  RIDER = "RIDER",
  DRIVER = "DRIVER",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  BLOCK = "BLOCK",
  INACTIVE = "INACTIVE",
}
export enum IsDriverActive {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
  INACTIVE = "INACTIVE",
}
export enum IsAdminActive {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  SUSPENDED = "SUSPENDED",
}
export interface IVehicle {
  type: string;
  number: string;
  model: string;
}
export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isVerified?: boolean;
  role: Role;
  auths: IAuthProvider[];
  rides?: Types.ObjectId[];
  // drivers?: Types.ObjectId[];
  createdAt?: Date;
}

export interface IRider extends IUser {
  isActive?: IsActive;
}

export interface IDriver extends IUser {
  isActive?: IsDriverActive;
  isOnline?: boolean;
  vehicle: IVehicle;
}
export interface IAdmin extends IUser {
  isActive: IsAdminActive;
}
