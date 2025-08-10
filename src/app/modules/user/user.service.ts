import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IDriver, IRider, IUser, Role } from "./user.interface";
import { Driver, Rider } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { sendEmail } from "../../utils/sendEmail";
import { redisClient } from "../../config/redis.config";
import { generateOtp } from "../../utils/generateOtp";
const OTP_EXPIRATION = 2 * 60;
const createUser = async (payload: Partial<IUser>, Model: any) => {
  const { email, password, role, ...rest } = payload as Partial<IUser>;

  const isUserExist = await Model.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await Model.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  if (!user) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User creation failed"
    );
  }
  const otp = generateOtp();

  const redisKey = `otp:${email}`;

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });

  await sendEmail({
    to: email as string,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: rest.name,
      otp: otp,
    },
  });
  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IRider> | Partial<IDriver>,
  decodedToken: JwtPayload
) => {
  if (
    decodedToken.role === Role.RIDER ||
    decodedToken.role === Role.DRIVER ||
    decodedToken.role === Role.ADMIN
  ) {
    if (userId !== decodedToken.userId) {
      console.log("decodedToken", decodedToken);
      throw new AppError(401, "You are not authorized");
    }
  }
  let newUpdatedUser;
  if (decodedToken.role === Role.RIDER) {
    const ifUserExist = await Rider.findById(userId);

    if (!ifUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    if (ifUserExist.isActive === "BLOCK") {
      throw new AppError(401, "You are not authorized");
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
      if (
        decodedToken.role === Role.RIDER ||
        decodedToken.role === Role.DRIVER ||
        decodedToken.role === Role.ADMIN
      ) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
      }
    }

    newUpdatedUser = await Rider.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
    });
  }
  if (decodedToken.role === Role.DRIVER) {
    const ifUserExist = await Driver.findById(userId);

    if (!ifUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    if (ifUserExist.isActive === "SUSPENDED") {
      throw new AppError(
        401,
        "You are not authorized because you are suspended"
      );
    }

    if (payload.isDeleted || payload.isVerified) {
      if (
        decodedToken.role === Role.RIDER ||
        decodedToken.role === Role.DRIVER ||
        decodedToken.role === Role.ADMIN
      ) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
      }
    }

    newUpdatedUser = await Driver.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true,
    });
  }

  return newUpdatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build().select("-password"),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  getMe,
};
