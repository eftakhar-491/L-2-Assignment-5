import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

import httpStatus from "http-status-codes";
import { driverService } from "./driver.service";
import { NextFunction, Request, Response } from "express";
const getDriverEarningHistory = catchAsync(
  async (req: Request, res: Response) => {
    const driverId = req.params.driverId;
    const earnings = await driverService.getDriverEarningHistory(driverId);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver earnings retrieved successfully",
      data: earnings,
    });
  }
);

export const updateAvailabilityStatus = catchAsync(
  async (req: Request, res: Response) => {
    const driverId = (req.user as JwtPayload).userId as string;
    const { isOnline } = req.body;
    const updatedDriver = await driverService.updateAvailabilityStatus(
      driverId,
      isOnline
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver availability status updated successfully",
      data: updatedDriver,
    });
  }
);
const getDriverNearestRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const { latitude, longitude } = req.body;
    const driverRides = await driverService.getDriverNearestRides(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver rides retrieved successfully",
      data: driverRides,
    });
  }
);
const getDriverMyRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverId = (req.user as JwtPayload).userId as string;
    const driverRides = await driverService.getDriverMyRides(driverId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Driver rides retrieved successfully",
      data: driverRides,
    });
  }
);
export const driverControllers = {
  getDriverEarningHistory,
  updateAvailabilityStatus,
  getDriverNearestRides,
  getDriverMyRides,
};
