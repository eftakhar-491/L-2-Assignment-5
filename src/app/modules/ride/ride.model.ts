import { model, Schema } from "mongoose";
import { IRide, IRideHistory, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
  {
    rider: { type: String, ref: "User", required: true },
    driver: { type: String, ref: "User" },
    otp: { type: Number },
    isRideOTPVerified: { type: Boolean, default: false },
    fee: { type: Number, required: true },
    isRideAccepted: { type: Boolean, default: false },
    pickupLocation: {
      address: { type: String, required: true },
      latitude: { type: String },
      longitude: { type: String },
      boundingbox: { type: [String] },
    },
    isDeleted: { type: Boolean, default: false },
    dropoffLocation: {
      address: { type: String, required: true },
      latitude: { type: String },
      longitude: { type: String },
      boundingbox: { type: [String] },
    },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },
    isPaid: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const rideHistorySchema = new Schema<IRideHistory>(
  {
    rideId: { type: String, ref: "Ride", required: true },
    updatedTimestamp: { type: Date, required: true, default: null },
    updatedBy: { type: String, default: null },
    isPaid: { type: Boolean, default: null },
    isRideAccepted: { type: Boolean, default: null },
    status: { type: String, enum: Object.values(RideStatus), default: null },
    fee: { type: Number, default: null },
    otp: { type: Number, default: null },
    isRideOTPVerified: { type: Boolean, default: null },
    isDeleted: { type: Boolean, default: null },
    pickupLocation: {
      address: { type: String, default: null },
      latitude: { type: String, default: null },
      longitude: { type: String, default: null },
      boundingbox: { type: [String], default: null },
    },
    dropoffLocation: {
      address: { type: String, default: null },
      latitude: { type: String, default: null },
      longitude: { type: String, default: null },
      boundingbox: { type: [String], default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const RideHistory = model<IRideHistory>(
  "RideHistory",
  rideHistorySchema
);
const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
