import { NextFunction, Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import AppError from "../../errorHelpers/AppError";

import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import { Role } from "./user.interface";
import { Admin, Driver, Rider } from "./user.model";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let user;

    const userRole = req.body.role;
    switch (userRole) {
      case Role.RIDER:
        // Handle rider specific logic
        user = await UserServices.createUser(req.body, Rider);
        break;
      case Role.DRIVER:
        // Handle driver specific logic
        user = await UserServices.createUser(req.body, Driver);
        break;
      case Role.ADMIN:
        user = await UserServices.createUser(req.body, Admin);

        break;
      default:
        throw new AppError(httpStatus.FORBIDDEN, "Invalid user role");
    }
    if (!user) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "User creation failed"
      );
    }
    const userTokens = await createUserTokens(user);
    const { password: $pass$, ...rest } = user.toObject();
    setAuthCookie(res, userTokens);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User created and logged in successfully",
      data: {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest,
      },
    });
  }
);
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_SECRET as string
    ) as JwtPayload;

    // const verifiedToken = req.user;
    let user;
    const payload = req.body;

    const userRole = (req.user as JwtPayload).role as string;

    switch (userRole) {
      case Role.RIDER:
        // Handle rider specific logic
        user = await UserServices.updateUser(
          userId,
          payload,
          verifiedToken as JwtPayload,
          Rider
        );
        break;
      case Role.DRIVER:
        // Handle driver specific logic
        user = await UserServices.updateUser(
          userId,
          payload,
          verifiedToken as JwtPayload,
          Driver
        );
        break;
      case Role.ADMIN:
        user = await UserServices.updateUser(
          userId,
          payload,
          verifiedToken as JwtPayload,
          Admin
        );

        break;
      default:
        throw new AppError(httpStatus.FORBIDDEN, "Invalid user role");
    }

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // })

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    let user;

    const userRole = (req.user as JwtPayload).role as string;
    switch (userRole) {
      case Role.RIDER:
        // Handle rider specific logic
        user = await UserServices.getAllUsers(
          query as Record<string, string>,
          Rider
        );
        break;
      case Role.DRIVER:
        // Handle driver specific logic
        user = await UserServices.getAllUsers(
          query as Record<string, string>,
          Driver
        );
        break;
      case Role.ADMIN:
        user = await UserServices.getAllUsers(
          query as Record<string, string>,
          Admin
        );
        break;
      default:
        throw new AppError(httpStatus.FORBIDDEN, "Invalid user role");
    }
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved Successfully",
      data: user.data,
      meta: user.meta,
    });
  }
);
const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    if (!decodedToken || !decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }
    let user;

    const userRole = (req.user as JwtPayload).role as string;
    switch (userRole) {
      case Role.RIDER:
        // Handle rider specific logic
        user = await UserServices.getMe(decodedToken.userId, Rider);
        break;
      case Role.DRIVER:
        // Handle driver specific logic
        user = await UserServices.getMe(decodedToken.userId, Driver);
        break;
      case Role.ADMIN:
        user = await UserServices.getMe(decodedToken.userId, Admin);
        break;
      default:
        throw new AppError(httpStatus.FORBIDDEN, "Invalid user role");
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your profile Retrieved Successfully",
      data: user.data,
    });
  }
);
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const user = await UserServices.getSingleUser(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Retrieved Successfully",
      data: user.data,
    });
  }
);
export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  getSingleUser,
  getMe,
};
