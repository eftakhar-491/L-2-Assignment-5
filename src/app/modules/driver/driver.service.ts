import AppError from "../../errorHelpers/AppError";
import { IPickupAndDropoffLocation } from "../ride/ride.interface";
import Ride from "../ride/ride.model";
import { Driver } from "../user/user.model";
import httpStatus from "http-status-codes";
const getDriverEarningHistory = async (driverId: string) => {
  // Logic to retrieve driver's earning history from the database

  const rides = await Ride.find(
    { driver: driverId },
    { fee: 1, status: 1, _id: 1 }
  ).lean();

  const completedRides = rides.filter((ride) => ride.status === "COMPLETED");
  const totalEarnings = completedRides.reduce(
    (sum, ride) => sum + (Number(ride.fee) || 0),
    0
  );
  return {
    rides,
    totalEarnings,
  };
};
const updateAvailabilityStatus = async (
  driverId: string,
  isOnline: boolean
) => {
  // Logic to update driver's availability status in the database
  return await Driver.findByIdAndUpdate(
    driverId,
    { isOnline },
    { new: true }
  ).lean();
};
const getDriverNearestRides = async (payload: IPickupAndDropoffLocation) => {
  // window.navigator.geolocation.getCurrentPosition((data)=>{console.log(data) } ,(data)=>{console.log(data) })
  const { latitude, longitude } = payload;
  if (!latitude || !longitude) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid location data");
  }
  const driverRides = await Ride.find().lean();
  // const nearestLocations = getNearestLocations(payload, driverRides);

  if (!driverRides) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found for this driver");
  }
  return driverRides;
};
const getDriverMyRides = async (driverId: string) => {
  console.log(driverId);
  const driverRides = await Ride.find({ driver: driverId }).lean();
  if (!driverRides) {
    throw new AppError(httpStatus.NOT_FOUND, "No rides found for this driver");
  }
  return driverRides;
};

export const driverService = {
  getDriverEarningHistory,
  updateAvailabilityStatus,
  getDriverNearestRides,
  getDriverMyRides,
};
