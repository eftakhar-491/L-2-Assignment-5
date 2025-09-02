import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import {
  IAdmin,
  IAuthProvider,
  IDriver,
  IRider,
  IsActive,
  IUser,
  Role,
} from "./user.interface";
import { Admin, Driver, Rider, User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { sendEmail } from "../../utils/sendEmail";
import { redisClient } from "../../config/redis.config";
import { generateOtp } from "../../utils/generateOtp";
import { canUpdateStatus } from "../../helpers/canUpdateIsActive";
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
  payload: Partial<IRider> | Partial<IDriver> | Partial<IAdmin>,
  decodedToken: JwtPayload,
  Model: any
) => {
  if (
    decodedToken.role === Role.RIDER ||
    decodedToken.role === Role.DRIVER ||
    decodedToken.role === Role.ADMIN
  ) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await Model.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const { password: $pass$, ...newUpdatedUser } = await Model.findByIdAndUpdate(
    userId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  return newUpdatedUser;
};

const getAllUsers = async (query: Record<string, string>, Model: any) => {
  const queryBuilder = new QueryBuilder(Model.find(), query);
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

const getMe = async (userId: string, Model: any) => {
  const user = await Model.findById(userId).select("-password");
  return {
    data: user,
  };
};
const updateUserData = async (
  userId: string,
  payload: Partial<IRider | IDriver | IAdmin>,
  accessRole: Role
) => {
  const existingUser = await User.findById(userId).lean();
  if (!existingUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const sharedFields: any = {};
  if (payload.name) sharedFields.name = payload.name;
  if (payload.email) sharedFields.email = payload.email;
  if (payload.phone) sharedFields.phone = payload.phone;
  if (payload.picture) sharedFields.picture = payload.picture;
  if (payload.address) sharedFields.address = payload.address;
  if (
    (!payload.isDeleted || payload.isDeleted) &&
    typeof payload.isDeleted !== "undefined"
  )
    sharedFields.isDeleted = payload.isDeleted;

  if (payload.role && accessRole !== Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Only admin can change role");
  } else {
    await User.deleteOne({ _id: userId });

    if (payload.role === Role.RIDER) {
      await Rider.create({ ...existingUser, _id: userId, role: payload.role });
    } else if (payload.role === Role.DRIVER) {
      await Driver.create({ ...existingUser, _id: userId, role: payload.role });
    } else if (payload.role === Role.ADMIN) {
      await Admin.create({ ...existingUser, _id: userId, role: payload.role });
    }
  }
  if (payload.isActive && !canUpdateStatus(accessRole, payload.isActive)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to change isActive status"
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, sharedFields, {
    new: true,
    runValidators: true,
  }).lean();

  let roleDoc;
  const role = existingUser.role || accessRole;

  switch (role) {
    case Role.RIDER:
      roleDoc = await Rider.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
      }).lean();

      break;

    case Role.DRIVER:
      roleDoc = await Driver.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
      }).lean();
      break;

    case Role.ADMIN:
      roleDoc = await Admin.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
      }).lean();
      break;
  }

  if (updatedUser?.password) {
    delete updatedUser.password;
  }

  return {
    user: { ...updatedUser, ...roleDoc },
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  getMe,
  updateUserData,
};
