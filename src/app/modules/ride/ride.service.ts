import { NextFunction, Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide, RideStatus } from "./ride.interface";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import Ride from "./ride.model";
import { generateOtp } from "../../utils/generateOtp";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
const OTP_EXPIRATION = 2 * 60;
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
    ...payload,
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

const getPriceAndDetails = async (payload: Partial<IRide>) => {
  if (!payload) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  // map lat,lng and distance etc
  const { pickupLocation, dropoffLocation } = payload as Partial<IRide>;

  return {
    fee: Math.floor(Math.random() * 100) + 1, // Random fee for demonstration
    estimatedTime: Math.floor(Math.random() * 60) + 1, // Random estimated time in minutes
    pickupLocation,
    dropoffLocation,
  };
};

// ride accept

const rideAccept = async (rideId: string, status: RideStatus) => {
  if (!rideId || !status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  if (ride.status === status) {
    return "Ride status has changed";
  }
  if (ride.status !== RideStatus.ACCEPTED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Ride can only be accepted from REQUESTED status"
    );
  }
  await Ride.updateOne({ _id: rideId }, { status });
  const updatedRide = await Ride.findById(rideId);
  return updatedRide;
};

const rideCancel = async (rideId: string, status: RideStatus) => {
  if (!rideId || !status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  if (ride.status === status) {
    return ride;
  }

  if (
    ride.status === RideStatus.IN_TRANSIT ||
    ride.status === RideStatus.COMPLETED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Ride cannot be cancelled once it is in transit or completed"
    );
  }

  await Ride.updateOne({ _id: rideId }, { status });

  const updatedRide = await Ride.findById(rideId);

  return updatedRide;
};

// const ridePickup = async (rideId: string, status: RideStatus) => {
//   if (!rideId || !status) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
//   }
//   const ride = await Ride.findById(rideId);
//   if (!ride) {
//     throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
//   }
//   const rider = await User.findById(ride.rider);
//   if (!rider) {
//     throw new AppError(httpStatus.NOT_FOUND, "Rider not found");
//   }
//   const email = rider.email;
//   if (ride.status === status) {
//     return ride;
//   }
//   if (!RideStatus.CANCELLED) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       "Ride can only be cancelled from REQUESTED status"
//     );
//   }
//   if (!RideStatus.PICKED_UP) {
//     throw new AppError(httpStatus.FORBIDDEN, "status can be IN_TRANSIT");
//   }

//   await Ride.updateOne({ _id: rideId }, { status });
//   const updatedRide = await Ride.findById(rideId);

//   return updatedRide;
// };

const rideOtpSend = async (rideId: string, status: RideStatus) => {
  if (!rideId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  const rider = await User.findById(ride.rider);

  if (!rider) {
    throw new AppError(httpStatus.NOT_FOUND, "Rider not found");
  }
  const email = rider.email;

  if (ride.isRideOTPVerified) {
    return ride;
  }
  if (!RideStatus.PICKED_UP) {
    throw new AppError(httpStatus.FORBIDDEN, "Status can be PICKED_UP");
  }

  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: rider.name,
      otp: otp,
    },
  });
  if (status) {
    await Ride.updateOne({ _id: rideId }, { status });
  }

  const updatedRide = await Ride.findById(rideId);

  return updatedRide;
};
const rideOtpVerify = async (otp: string, rideId: string) => {
  // const user = await User.findOne({ email, isVerified: false })
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(404, "Ride data not found");
  }
  const rider = await User.findById(ride.rider);
  if (!rider) {
    throw new AppError(404, "Rider not found");
  }

  const email = rider.email;
  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) {
    throw new AppError(401, "Invalid OTP");
  }

  if (savedOtp !== otp) {
    throw new AppError(401, "Invalid OTP provided");
  }

  await Promise.all([
    Ride.updateOne(
      { _id: rideId },
      { isRideOTPVerified: true, otp, status: RideStatus.IN_TRANSIT }
    ),
    redisClient.del([redisKey]),
  ]);
  return {
    ...ride,
    status: RideStatus.IN_TRANSIT,
  };
};

const rideComplete = async (rideId: string, status: RideStatus.COMPLETED) => {
  if (!rideId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  if (ride.status !== RideStatus.IN_TRANSIT) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Ride can only be completed from IN_TRANSIT status"
    );
  }
  if (status !== RideStatus.COMPLETED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Ride can only be completed with COMPLETED status"
    );
  }
  await Ride.updateOne({ _id: rideId }, { status });
  const updatedRide = await Ride.findById(rideId);
  return updatedRide;
};

export const rideService = {
  createRide,
  updateRide,
  getPriceAndDetails,
  rideAccept,
  rideCancel,
  // ridePickup,
  rideOtpSend,
  rideOtpVerify,
  rideComplete,
};
