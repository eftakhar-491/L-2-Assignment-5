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
    console.log(user);

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

    const payload = req.body;

    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    // res.status(httpStatus.CREATED).json({
    //     message: "User Created Successfully",
    //     user
    // })

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Users Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);
const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your profile Retrieved Successfully",
      data: result.data,
    });
  }
);
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Retrieved Successfully",
      data: result.data,
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
