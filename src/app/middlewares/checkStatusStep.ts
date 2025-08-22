import { NextFunction, Request, Response } from "express";
import { RideStatus } from "../modules/ride/ride.interface";
import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/AppError";
import Ride from "../modules/ride/ride.model";
export const checkStatusStep =
  (status: RideStatus) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);

    if (!ride) {
      return next(new AppError(httpStatus.NOT_FOUND, "Ride not found"));
    }

    if (status === RideStatus.REQUESTED) {
      return next(
        new AppError(httpStatus.FORBIDDEN, "Ride is still requested")
      );
    }

    if (
      status === RideStatus.ACCEPTED &&
      (ride.status === RideStatus.PICKED_UP ||
        ride.status === RideStatus.IN_TRANSIT ||
        ride.status === RideStatus.COMPLETED ||
        ride.status === RideStatus.CANCELLED ||
        ride.status === RideStatus.ACCEPTED)
    ) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Ride must be ACCEPTED previous status is requested"
        )
      );
    }
    if (
      status === RideStatus.PICKED_UP &&
      (ride.status === RideStatus.PICKED_UP ||
        ride.status === RideStatus.REQUESTED ||
        ride.status === RideStatus.IN_TRANSIT ||
        ride.status === RideStatus.COMPLETED ||
        ride.status === RideStatus.CANCELLED)
    ) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Ride must be PICKED_UP previous status is ACCEPTED"
        )
      );
    }

    if (
      status === RideStatus.COMPLETED &&
      (ride.status === RideStatus.PICKED_UP ||
        ride.status === RideStatus.COMPLETED ||
        ride.status === RideStatus.CANCELLED ||
        ride.status === RideStatus.ACCEPTED ||
        ride.status === RideStatus.REQUESTED)
    ) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Ride must be COMPLETED previous status is IN_TRANSIT"
        )
      );
    }
    if (
      status === RideStatus.CANCELLED &&
      (ride.status === RideStatus.COMPLETED ||
        ride.status === RideStatus.CANCELLED ||
        ride.status === RideStatus.IN_TRANSIT)
    ) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          "Ride is COMPLETED , CANCELLED or IN_TRANSIT"
        )
      );
    }

    return next();
  };
