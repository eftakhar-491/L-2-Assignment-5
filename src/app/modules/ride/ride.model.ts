import { model, Schema } from "mongoose";
import { IRide, IRideHistory, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
  {
    rider: { type: String, ref: "User", required: true },
    driver: { type: String, ref: "User" },
    otp: { type: Number },
    isRideOTPVerified: { type: Boolean, default: false },
    fee: { type: Number, required: true },
    pickupLocation: {
      address: { type: String, required: true },
      latitude: { type: String },
      longitude: { type: String },
      boundingbox: { type: [String] },
    },
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
const rideHistorySchema = new Schema<IRideHistory>(
  {
    rideId: { type: String, ref: "Ride", required: true },
    status: { type: String, enum: Object.values(RideStatus) },
    updatedTimestamp: { type: Date, required: true },
    fee: { type: Number },
    otp: { type: Number },
    isRideOTPVerified: { type: Boolean },
    pickupLocation: {
      address: { type: String },
      latitude: { type: String },
      longitude: { type: String },
      boundingbox: { type: [String] },
    },
    dropoffLocation: {
      address: { type: String },
      latitude: { type: String },
      longitude: { type: String },
      boundingbox: { type: [String] },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const RideHistory = model<IRideHistory>(
  "RideHistory",
  rideHistorySchema
);
const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
