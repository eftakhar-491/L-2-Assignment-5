import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RideStatus } from "./ride.interface";
import Ride from "./ride.model";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { rideService } from "./ride.service";
import AppError from "../../errorHelpers/AppError";
const createRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newRide = await rideService.createRide(req.body, req);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Ride requested successfully",
      data: newRide,
    });
  }
);
const updateRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedRide = await rideService.updateRide(req.body, req, next);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);

export const rideController = {
  createRide,
  updateRide,
};
