import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";

import { checkRole } from "../../middlewares/checkRole";
import { Role } from "../user/user.interface";
import { driverControllers } from "./driver.controller";

// /api/v1/driver/
const route = Router();

route.get(
  "/total-earnings/:driverId",
  checkAuth(Role.DRIVER),
  driverControllers.getDriverEarningHistory
);
route.get(
  "/my-rides",
  checkAuth(Role.DRIVER),
  driverControllers.getDriverMyRides
);
route.post(
  "/availability-status",
  checkAuth(Role.DRIVER),
  driverControllers.updateAvailabilityStatus
);
route.post(
  "/get-driver-nearest-rides",
  checkAuth(Role.DRIVER),
  driverControllers.getDriverNearestRides
);

export const DriverRoutes = route;
