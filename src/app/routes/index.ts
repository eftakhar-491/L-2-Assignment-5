import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { HomeRoutes } from "../modules/home/home.route";
import { AuthRoutes } from "../modules/auth/auth.route";

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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
