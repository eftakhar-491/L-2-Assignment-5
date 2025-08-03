import Router from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { rideController } from "./ride.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createRideZodSchema, updateRideZodSchema } from "./ride.validetion";
import { Role } from "../user/user.interface";

const route = Router();

route.post(
  "/request-ride",
  checkAuth(Role.RIDER),
  validateRequest(createRideZodSchema),
  rideController.createRide
);
route.put(
  "/update-ride/:id",
  checkAuth(Role.RIDER),
  validateRequest(updateRideZodSchema),
  rideController.updateRide
);

export const RideRoutes = route;
