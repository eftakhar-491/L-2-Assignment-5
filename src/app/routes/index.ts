import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { HomeRoutes } from "../modules/home/home.route";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// router.use("/user", UserRoutes)
// router.use("/tour", TourRoutes)
// router.use("/division", DivisionRoutes)
// router.use("/booking", BookingRoutes)
// router.use("/user", UserRoutes)
