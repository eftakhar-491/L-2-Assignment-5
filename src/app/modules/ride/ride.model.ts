import { model, Schema } from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const rideSchema = new Schema<IRide>({
  user: { type: String, ref: "User", required: true },
  driver: { type: String, ref: "User", required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(RideStatus),
    default: RideStatus.PICKED_UP,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
