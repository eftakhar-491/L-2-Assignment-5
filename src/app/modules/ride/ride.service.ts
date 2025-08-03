import { Request } from "express";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IRide } from "./ride.interface";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import Ride from "./ride.model";
import axios from "axios";

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

const updateRide = async (payload: Partial<IRide>, req: Request) => {
  return {};
};
export const rideService = {
  createRide,
  updateRide,
};
