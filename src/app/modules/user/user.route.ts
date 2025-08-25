import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validetion";
import { Role } from "./user.interface";
import { checkRole } from "../../middlewares/checkRole";

// /api/v1/user/
const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers);

router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);

router.get("/:id", checkAuth(Role.ADMIN), UserControllers.getSingleUser);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  checkRole(...Object.values(Role)),
  UserControllers.updateUser
);

export const UserRoutes = router;
