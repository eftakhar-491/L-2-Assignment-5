import { NextFunction, Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import Ride from "./ride.model";

const createRide = async (payload: Partial<IRide>, req: Request) => {
  const { pickupLocation, dropoffLocation } = payload as Partial<IRide>;

  const { email } = req.user as JwtPayload;
  if (!email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "User is not authenticated or email is missing. Please log in."
    );
  }
  const isUserExist = await User.findOne({ email });
  console.log(isUserExist);

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Are not Exist");
  }
  //   const pickupGeoLocationPromise = await fetch(`
  //       https://geocode.maps.co/search?q=${pickupLocation?.address}&api_key=${envVars.GEO_API_KEY}
  //       `);

  //   const dropoffGeoLocationPromise = await fetch(`
  //     https://geocode.maps.co/search?q=${dropoffLocation?.address}&api_key=${envVars.GEO_API_KEY}
  //     `);

  //   const pickupGeoLocation = await pickupGeoLocationPromise.json();
  //   const dropoffGeoLocation = await dropoffGeoLocationPromise.json();
  //   console.log("Dropoff Geo Location: ", dropoffGeoLocation[0]);

  //   console.log("Pickup Geo Location: ", pickupGeoLocation[0]);
  const ride = await Ride.create({
    rider: isUserExist._id,
    pickupLocation: {
      address: pickupLocation?.address,
      //   latitude: pickupGeoLocation[0]?.lat || null,
      //   longitude: pickupGeoLocation[0]?.lon || null,
      //   boundingbox: pickupGeoLocation[0]?.boundingbox || null,
      latitude: null,
      longitude: null,
      boundingbox: null,
    },
    dropoffLocation: {
      address: dropoffLocation?.address,
      latitude: null,
      longitude: null,
      boundingbox: null,
    },
  });

  return ride;
};

const updateRide = async (
  payload: Partial<IRide>,
  req: Request,
  next: NextFunction
) => {
  const { id } = req.params;
  const { status, driver } = payload as Partial<IRide>;
  const user = req.user as JwtPayload;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is not authenticated");
  }

  const ride = await Ride.findById(id);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  const rideStatusSequence = [
    RideStatus.REQUESTED,
    RideStatus.ACCEPTED,
    RideStatus.PICKED_UP,
    RideStatus.IN_TRANSIT,
    RideStatus.COMPLETED,
  ];

  const currentStatusIndex = rideStatusSequence.indexOf(
    ride.status as RideStatus
  );
  const newStatusIndex = rideStatusSequence.indexOf(status as RideStatus);
  const isCancellation = status === RideStatus.CANCELLED;

  // Validate current status
  if (currentStatusIndex === -1) {
    next(new AppError(httpStatus.BAD_REQUEST, "Invalid current ride status."));
  }

  // ADMIN can do anything
  if (user.role === "ADMIN") {
    // skip validation
  }

  // DRIVER logic
  else if (user.role === "DRIVER") {
    // Cannot cancel after IN_TRANSIT
    if (
      isCancellation &&
      currentStatusIndex >= rideStatusSequence.indexOf(RideStatus.IN_TRANSIT)
    ) {
      next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Driver cannot cancel ride after it is in transit."
        )
      );
    }

    // always allow move status forward
    if (!isCancellation && newStatusIndex <= currentStatusIndex) {
      next(
        new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid status transition from ${ride.status} to ${status}. Status can only move forward.`
        )
      );
    }
  } else if (user.role === "RIDER") {
    // Rider can only cancel before IN_TRANSIT
    if (!isCancellation) {
      next(
        new AppError(httpStatus.FORBIDDEN, "Rider can only cancel the ride.")
      );
    }

    if (
      currentStatusIndex >= rideStatusSequence.indexOf(RideStatus.IN_TRANSIT)
    ) {
      next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Rider cannot cancel ride after it is in transit."
        )
      );
    }
  }

  // Other roles not allowed
  else {
    next(
      new AppError(
        httpStatus.FORBIDDEN,
        "User is not authorized to update this ride."
      )
    );
  }

  // ✅ Proceed to update the ride
  if (status) {
    ride.status = status;
  }
  if (driver) {
    ride.driver = driver;
  }

  await ride.save();

  return ride;
};

export const rideService = {
  createRide,
  updateRide,
};
