"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
// import { Role } from "./user.interface";
// import { updateUserZodSchema } from "./user.validation";
const router = (0, express_1.Router)();
router.post("/register", 
//   validateRequest(createUserZodSchema),
user_controller_1.UserControllers.createUser);
// router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
// router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe)
// router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser)
// router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)
// /api/v1/user/:id
exports.UserRoutes = router;
