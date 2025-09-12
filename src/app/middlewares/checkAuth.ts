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

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization || req.cookies.accessToken;

      if (!accessToken) {
        throw new AppError(403, "No Token Recieved");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET as string
      ) as JwtPayload;
      let Model: any;
      switch (verifiedToken.role) {
        case Role.ADMIN:
          // Admin specific logic
          Model = Admin;
          break;
        case Role.DRIVER:
          // Driver specific logic
          Model = Driver;
          break;
        case Role.RIDER:
          // Rider specific logic
          Model = Rider;
          break;
        default:
          throw new AppError(httpStatus.FORBIDDEN, "Invalid user role");
      }

      const isUserExist = await Model.findOne({ email: verifiedToken.email });
      console.log("checkAuth", isUserExist);
      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
      }
      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
      }
      if (
        isUserExist.isActive === IsActive.BLOCK ||
        isUserExist.isActive === IsDriverActive.SUSPENDED ||
        isUserExist.isActive === IsDriverActive.REQUESTED ||
        isUserExist.isActive === IsAdminActive.SUSPENDED ||
        isUserExist.isActive === IsAdminActive.REQUESTED
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }
      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(403, "You are not permitted to view this route!!!");
      }
      req.user = verifiedToken;
      next();
    } catch (error) {
      console.log("jwt error", error);
      next(error);
    }
  };
