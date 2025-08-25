import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { HomeRoutes } from "../modules/home/home.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { DriverRoutes } from "../modules/driver/driver.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/",
    route: HomeRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/ride",
    route: RideRoutes,
  },
  {
    path: "/driver",
    route: DriverRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
