import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import {
  IsActive,
  IsAdminActive,
  IsDriverActive,
  Role,
} from "../modules/user/user.interface";
import { Admin, Driver, Rider, User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkRole =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as { role: Role }).role;
    if (!role) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User role not found");
    }
    try {
      if (!authRoles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this resource"
        );
      }

      // If role is DRIVER, restrict certain actions
      if (role === Role.DRIVER) {
        if (
          req.body.hasOwnProperty("role") ||
          req.body.isDriverActive === IsDriverActive.SUSPENDED ||
          req.body.isDriverActive === IsDriverActive.APPROVED ||
          (req.body.role && req.body.role !== Role.DRIVER)
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Drivers are not allowed to perform this action"
          );
        }
      }

      // If role is RIDER, restrict certain actions
      if (role === Role.RIDER) {
        if (
          req.body.hasOwnProperty("role") ||
          req.body.isActive === IsActive.BLOCK ||
          req.body.isActive === IsActive.INACTIVE ||
          (req.body.role && req.body.role !== Role.RIDER)
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Riders are not allowed to perform this action"
          );
        }
      }
      // Admin can access all
      if (role === Role.ADMIN) {
        if (
          req.body.hasOwnProperty("role") ||
          req.body.isActive === IsAdminActive.REQUESTED ||
          req.body.isActive === IsAdminActive.SUSPENDED ||
          !req.body.role
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Admins are not allowed to perform this action"
          );
        }
      }

      next();
    } catch (error) {
      console.log("Role check error", error);
      next(error);
    }
  };
