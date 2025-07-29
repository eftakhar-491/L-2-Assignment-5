import { NextFunction, Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import AppError from "../../errorHelpers/AppError";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);

    const user = await UserServices.createUser(req.body);
    console.log(user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  }
);

export const UserControllers = {
  createUser,
};
