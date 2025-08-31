import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RideStatus } from "./ride.interface";
import Ride from "./ride.model";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { rideService } from "./ride.service";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";
const getPriceAndDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rideDetails = await rideService.getPriceAndDetails(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride price and details retrieved successfully",
      data: rideDetails,
    });
  }
);
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
const rideAccept = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { status } = req.body;
    const { userId } = req.user as JwtPayload;

    const updatedRide = await rideService.rideAccept(rideId, status, userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);
const rideCancel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { status } = req.body;
    const accessUserId = (req.user as JwtPayload).userId;
    const updatedRide = await rideService.rideCancel(
      rideId,
      status,
      accessUserId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);

const rideOtpSend = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { status } = req.body;

    const updatedRide = await rideService.rideOtpSend(rideId, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);
const rideOtpVerify = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { otp } = req.body;

    const updatedRide = await rideService.rideOtpVerify(otp, rideId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);
const rideComplete = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { status } = req.body;

    const updatedRide = await rideService.rideComplete(rideId, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride status updated successfully",
      data: updatedRide,
    });
  }
);
const getRideHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;

    const rideHistory = await rideService.getRideHistory(rideId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride history retrieved successfully",
      data: rideHistory,
    });
  }
);

const getAllRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allRides = await rideService.getAllRides();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rides retrieved successfully",
      data: allRides,
    });
  }
);
const getRiderPastRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const riderId = (req.user as JwtPayload).userId;
    const allRides = await rideService.getRiderPastRides(riderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rides retrieved successfully",
      data: allRides,
    });
  }
);
const ridePayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rideId } = req.params;
    const { paymentInfo } = req.body;

    const updatedRide = await rideService.ridePayment(rideId, paymentInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Ride payment processed successfully",
      data: updatedRide,
    });
  }
);
export const rideController = {
  createRide,
  updateRide,
  getPriceAndDetails,
  rideAccept,
  getRideHistory,
  rideCancel,
  rideOtpSend,
  rideOtpVerify,
  rideComplete,
  getAllRides,
  getRiderPastRides,
  ridePayment,
};
