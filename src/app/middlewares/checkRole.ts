import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/AppError";
import {
  IsActive,
  IsAdminActive,
  IsDriverActive,
  Role,
} from "../modules/user/user.interface";
import { Admin, Driver, Rider } from "../modules/user/user.model";

export const checkRole =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as JwtPayload).role;
    const userId = (req.user as JwtPayload).userId;

    if (!role) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "User role or user not found"
      );
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
        const user = await Driver.findById(userId);
        if (
          !user ||
          user.isActive === IsDriverActive.REQUESTED ||
          user.isActive === IsDriverActive.SUSPENDED
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            `Drivers {${user?.isActive}} are not allowed to perform this action`
          );
        }
        if (
          req.body?.isActive === IsDriverActive.SUSPENDED ||
          req.body?.isActive === IsDriverActive.APPROVED ||
          req.body?.password ||
          req.body?.email ||
          req.body?.isDeleted ||
          req.body?.isVerified ||
          req.body?.isOnline ||
          (req.body?.role && req.body?.role !== Role.DRIVER)
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            "Drivers are not allowed to perform this action"
          );
        }
      }

      // If role is RIDER, restrict certain actions
      if (role === Role.RIDER) {
        const user = await Rider.findById(userId);
        if (!user || user.isActive === IsActive.BLOCK) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            `Riders {${user?.isActive}} are not allowed to perform this action`
          );
        }
        if (
          req.body.isActive === IsActive.BLOCK ||
          req.body?.password ||
          req.body?.email ||
          req.body?.isDeleted ||
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
        const user = await Admin.findById(userId);
        if (
          !user ||
          user.isActive === IsAdminActive.REQUESTED ||
          user.isActive === IsAdminActive.SUSPENDED
        ) {
          throw new AppError(
            httpStatus.FORBIDDEN,
            `Admins {${user?.isActive}} are not allowed to perform this action`
          );
        }
        if (
          req.body.isActive === IsAdminActive.REQUESTED ||
          req.body.isActive === IsAdminActive.SUSPENDED ||
          req.body?.password ||
          req.body?.email ||
          req.body?.isDeleted ||
          req.body?.isVerified ||
          (req.body.role && req.body.role !== Role.ADMIN)
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
