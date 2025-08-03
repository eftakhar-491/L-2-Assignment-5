import { model, Schema } from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>(
  {
    rider: { type: String, ref: "User", required: true },
    driver: { type: String, ref: "User" },
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

const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
