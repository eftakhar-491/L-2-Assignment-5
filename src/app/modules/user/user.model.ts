import mongoose, { Schema, Document, Model } from "mongoose";

import {
  IAdmin,
  IDriver,
  IRider,
  IsActive,
  IsAdminActive,
  IsDriverActive,
  IUser,
  IVehicle,
  Role,
} from "./user.interface";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(Role), required: true },
    auths: [
      {
        provider: {
          type: String,
          enum: ["google", "credentials"],
          message: "Invalid authentication provider",
        },
        providerId: { type: String },
      },
    ],
  },
  { timestamps: true, discriminatorKey: "role" }
);

const RiderSchema = new Schema<IRider>({
  isActive: {
    type: String,
    enum: Object.values(IsActive),
    default: IsActive.ACTIVE,
  },
});

const DriverSchema = new Schema<IDriver>({
  isActive: {
    type: String,
    enum: Object.values(IsDriverActive),
    default: IsDriverActive.REQUESTED,
  },
  isOnline: { type: Boolean, default: false },
  isRideAccepted: { type: Boolean, default: false },
  vehicle: {
    type: {
      type: String,
      required: true,
    },
    number: { type: String, required: true },
    model: { type: String, required: true },
  },
});

// Admin schema

const AdminSchema = new Schema<IAdmin>({
  isActive: {
    type: String,
    enum: Object.values(IsAdminActive),
    default: IsAdminActive.REQUESTED,
  },
});
// models
export const User = mongoose.model<IUser>("User", UserSchema);
export const Admin = User.discriminator<IAdmin>(Role.ADMIN, AdminSchema);

export const Rider = User.discriminator<IRider>(Role.RIDER, RiderSchema);
export const Driver = User.discriminator<IDriver>(Role.DRIVER, DriverSchema);
