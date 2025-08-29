import { NextFunction, Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { Driver, User } from "../user/user.model";
import { IPickupAndDropoffLocation, IRide, RideStatus } from "./ride.interface";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import Ride, { RideHistory } from "./ride.model";
import { generateOtp } from "../../utils/generateOtp";
import { redisClient } from "../../config/redis.config";
import { sendEmail } from "../../utils/sendEmail";
import getNearestLocations from "../../helpers/handleNearestRide";
import { IsDriverActive, Role } from "../user/user.interface";
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

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Are not Exist");
  }
  const rides = await Ride.find({
    rider: isUserExist._id,
    status: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });
  if (rides.length > 3) {
    return {
      alreadyMaxRequested: true,
      message: "You have reached the maximum number of ride requests.",
    };
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

const rideAccept = async (
  rideId: string,
  status: RideStatus,
  driverId: string
) => {
  if (!rideId || !status || !driverId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);
  const driver = await Driver.findById(driverId);
  if (!ride || !driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride or Driver not found");
  }
  if (
    driver.isActive === IsDriverActive.REQUESTED ||
    driver.isActive === IsDriverActive.SUSPENDED ||
    driver.isActive === IsDriverActive.INACTIVE
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "Driver is not Approved");
  }
  if (ride.isRideAccepted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Already Ride is accepted");
  }

  if (!driver.isOnline) {
    throw new AppError(httpStatus.BAD_REQUEST, "Driver is not online");
  }
  if (driver.isRideAccepted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver already accepted a ride"
    );
  }
  if (ride.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride is deleted");
  }

  if (ride.status === status) {
    return ride;
  }
  // if (status !== RideStatus.ACCEPTED) {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     "Ride can only be accepted from REQUESTED status"
  //   );
  // }
  await Ride.updateOne(
    { _id: rideId },
    { status, driver: driverId, isRideAccepted: true }
  );
  await Driver.updateOne({ _id: driverId }, { isRideAccepted: true });
  await RideHistory.create({
    rideId,
    status,
    updatedTimestamp: new Date(),
  });
  const updatedRide = await Ride.findById(rideId);
  return updatedRide;
};

const rideCancel = async (
  rideId: string,
  status: RideStatus,
  accessUserId: string
) => {
  if (!rideId || !status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  const user = await User.findById(accessUserId);
  console.log("user", user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (ride.status === status) {
    return ride;
  }
  switch (user.role) {
    case "DRIVER":
      await Ride.updateOne(
        { _id: rideId },
        { status: RideStatus.REQUESTED, isRideAccepted: false, driver: "" }
      );
      await Driver.updateOne({ _id: user._id }, { isRideAccepted: false });
      await RideHistory.create({
        rideId,
        status,
        updatedBy: user._id,
        isRideAccepted: false,
        driver: "",
        updatedTimestamp: new Date(),
      });
      break;
    case "RIDER":
      await Ride.updateOne(
        { _id: rideId },
        { status, isDeleted: true, isRideAccepted: false }
      );
      await Driver.updateOne({ _id: ride.driver }, { isRideAccepted: false });
      await RideHistory.create({
        rideId,
        status,
        isDeleted: true,
        updatedBy: user._id,
        updatedTimestamp: new Date(),
      });
      break;
    case "ADMIN":
      await Ride.updateOne(
        { _id: rideId },
        { status, driver: "", isRideAccepted: false }
      );
      await Driver.updateOne({ _id: user._id }, { isRideAccepted: false });
      await RideHistory.create({
        rideId,
        status,
        driver: "",
        updatedBy: user._id,
        isRideAccepted: false,

        updatedTimestamp: new Date(),
      });
      break;
    default:
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User is not authorized to cancel this ride."
      );
  }
  // if (
  //   ride.status === RideStatus.IN_TRANSIT ||
  //   ride.status === RideStatus.COMPLETED
  // ) {
  //   throw new AppError(
  //     httpStatus.FORBIDDEN,
  //     "Ride cannot be cancelled once it is in transit or completed"
  //   );
  // }

  const updatedRide = await Ride.findById(rideId);

  return updatedRide;
};

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
    await RideHistory.create({
      rideId,
      status,
      updatedTimestamp: new Date(),
    });
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
    RideHistory.create({
      rideId,
      status: RideStatus.IN_TRANSIT,
      updatedTimestamp: new Date(),
      otp: Number(otp),
      isRideOTPVerified: true,
    }),
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

  await Ride.updateOne({ _id: rideId }, { status });
  await RideHistory.create({
    rideId,
    status,
    updatedTimestamp: new Date(),
  });
  const updatedRide = await Ride.findById(rideId);
  return updatedRide;
};
const getRideHistory = async (rideId: string) => {
  if (!rideId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid ride details");
  }
  const rideHistory = await RideHistory.find({ rideId }).sort({
    updatedTimestamp: -1,
  });
  if (!rideHistory) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride history not found");
  }
  return rideHistory;
};

const getAllRides = async () => {
  const rides = await Ride.find().sort({ createdAt: -1 });
  return rides;
};
const getRiderPastRides = async (riderId: string) => {
  const rides = await Ride.find({ rider: riderId }).sort({ createdAt: -1 });
  return rides;
};
export const rideService = {
  createRide,
  updateRide,
  getPriceAndDetails,
  rideAccept,
  rideCancel,
  getRideHistory,
  // ridePickup,
  rideOtpSend,
  rideOtpVerify,
  rideComplete,
  getAllRides,
  getRiderPastRides,
};
