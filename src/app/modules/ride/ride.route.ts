import Router from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { rideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createRideZodSchema,
  rideAcceptZodSchema,
  rideCancelZodSchema,
  updateRideZodSchema,
} from "./ride.validetion";
import { Role } from "../user/user.interface";
import { checkStatusStep } from "../../middlewares/checkStatusStep";
import { RideStatus } from "./ride.interface";
import { checkRole } from "../../middlewares/checkRole";

const route = Router();
route.post(
  "/price-and-details",
  checkAuth(Role.RIDER, Role.ADMIN),
  rideController.getPriceAndDetails
);

route.post(
  "/request-ride",
  checkAuth(Role.RIDER, Role.ADMIN),
  validateRequest(createRideZodSchema),
  rideController.createRide
);
route.patch(
  "/ride-accept/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN),
  validateRequest(rideAcceptZodSchema),
  checkStatusStep(RideStatus.ACCEPTED),
  rideController.rideAccept
);
route.patch(
  "/ride-cancel/:rideId",
  checkAuth(...Object.values(Role)),

  validateRequest(rideCancelZodSchema),
  checkStatusStep(RideStatus.CANCELLED),
  rideController.rideCancel
);
// For picked up
route.patch(
  "/ride-picked-up-otp-send/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN),
  checkStatusStep(RideStatus.PICKED_UP),
  rideController.rideOtpSend
);
route.patch(
  "/ride-otp-verify/:rideId",
  checkAuth(Role.ADMIN, Role.RIDER),

  rideController.rideOtpVerify
);
// if successfully paid
route.patch(
  "/ride-complete/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN),
  checkStatusStep(RideStatus.COMPLETED),
  rideController.rideComplete
);
// get ride history
route.get(
  "/ride-history/:rideId",
  checkAuth(Role.RIDER, Role.DRIVER, Role.ADMIN),

  rideController.getRideHistory
);

route.get("/all-rides", checkAuth(Role.ADMIN), rideController.getAllRides);

route.get(
  "/rider-past-ride",
  checkAuth(Role.RIDER),
  rideController.getRiderPastRides
);

export const RideRoutes = route;
