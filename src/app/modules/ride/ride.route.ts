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

const route = Router();
route.post(
  "/price-and-details",
  checkAuth(Role.RIDER),
  rideController.getPriceAndDetails
);

route.post(
  "/request-ride",
  checkAuth(Role.RIDER),
  validateRequest(createRideZodSchema),
  rideController.createRide
);
route.patch(
  "/ride-accept/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN),
  validateRequest(rideAcceptZodSchema),
  rideController.rideAccept
);
route.patch(
  "/ride-cancel/:rideId",
  checkAuth(...Object.values(Role)),
  validateRequest(rideCancelZodSchema),
  rideController.rideCancel
);

route.patch(
  "/ride-pickup/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN),
  validateRequest(createRideZodSchema)
  // rideController.ridePickup
);
route.patch(
  "/ride-otp-send/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.RIDER),

  rideController.rideOtpSend
);
route.patch(
  "/ride-otp-verify/:rideId",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.RIDER),

  rideController.rideOtpVerify
);

route.post(
  "/ride-complete",
  checkAuth(Role.DRIVER, Role.RIDER),
  validateRequest(createRideZodSchema),
  rideController.createRide
);

route.put(
  "/update-ride/:id",
  checkAuth(Role.DRIVER, Role.RIDER),
  validateRequest(updateRideZodSchema),
  rideController.updateRide
);

export const RideRoutes = route;
