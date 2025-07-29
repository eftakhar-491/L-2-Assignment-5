"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const home_route_1 = require("../modules/home/home.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/",
        route: home_route_1.HomeRoutes,
    },
    {
        path: "/user",
        route: user_route_1.UserRoutes,
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
// router.use("/user", UserRoutes)
// router.use("/tour", TourRoutes)
// router.use("/division", DivisionRoutes)
// router.use("/booking", BookingRoutes)
// router.use("/user", UserRoutes)
