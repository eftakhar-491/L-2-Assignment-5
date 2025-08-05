import z from "zod";
import { RideStatus } from "./ride.interface";

export const createRideZodSchema = z.object({
  rider: z.string({ message: "Rider ID must be a string" }),
  driver: z.string({ message: "Driver ID must be a string" }).optional(),
  otp: z
    .number({ message: "OTP must be a number" })
    .min(1000, { message: "OTP must be at least 4 digits." })
    .max(9999, { message: "OTP cannot exceed 4 digits." }),
  fee: z
    .number({ message: "Fee must be a number" })
    .min(0, { message: "Fee cannot be negative." }),
  pickupLocation: z.object({
    address: z
      .string({ message: "Pickup address must be a string" })
      .min(2, {
        message: "Pickup address must be at least 2 characters long.",
      })
      .max(100, { message: "Pickup address cannot exceed 100 characters." }),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    boundingbox: z.array(z.string()).optional(),
  }),
  dropoffLocation: z.object({
    address: z
      .string({ message: "Dropoff address must be a string" })
      .min(2, {
        message: "Dropoff address must be at least 2 characters long.",
      })
      .max(100, { message: "Dropoff address cannot exceed 100 characters." }),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    boundingbox: z.array(z.string()).optional(),
  }),
  status: z
    .enum(Object.values(RideStatus) as [string], {
      message:
        "Ride status must be one of the {REQUESTED,ACCEPTED, PICKED_UP , IN_TRANSIT , COMPLETED} values.",
    })
    // .optional()
    .default(RideStatus.REQUESTED),
});

export const updateRideZodSchema = z.object({
  driver: z
    .string()
    .min(2, { message: "Driver ID must be at least 2 characters long." })
    .max(50, { message: "Driver ID cannot exceed 50 characters." })
    .optional(),
  status: z.enum(Object.values(RideStatus) as [string], {
    message:
      "Ride status must be one of the {REQUESTED, ACCEPTED, PICKED_UP , IN_TRANSIT , COMPLETED} values.",
  }),
});
