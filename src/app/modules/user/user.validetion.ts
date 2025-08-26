import z from "zod";
import {
  IsActive,
  IsAdminActive,
  IsDriverActive,
  Role,
} from "./user.interface";

export const createUserZodSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." }),

    email: z
      .string()
      .email({ message: "Invalid email address format." })
      .min(5, { message: "Email must be at least 5 characters long." })
      .max(100, { message: "Email cannot exceed 100 characters." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
      })
      .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
      })
      .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
      }),

    phone: z
      .string()
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    address: z
      .string()
      .max(200, { message: "Address cannot exceed 200 characters." })
      .optional(),

    role: z.enum(Object.values(Role), {
      message: "Role is required",
    }),

    auths: z
      .array(
        z.object({
          provider: z.enum(["google", "credentials"]),
          providerId: z.string().min(1, { message: "Provider ID is required" }),
        })
      )
      .optional(),

    // Optional role-specific fields
    isActive: z.string().optional(),
    isOnline: z.boolean().optional(),
    vehicle: z
      .object({
        type: z.string(),
        number: z.string(),
        model: z.string(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.RIDER) {
      if (
        data.isActive &&
        !Object.values(IsActive).includes(data.isActive as IsActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Rider isActive must be one of: ${Object.values(
            IsActive
          ).join(", ")}`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.vehicle) {
        ctx.addIssue({
          path: ["vehicle"],
          message: "Rider should not have a vehicle",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.role === Role.DRIVER) {
      if (!data.vehicle) {
        ctx.addIssue({
          path: ["vehicle"],
          message: "Vehicle is required for drivers",
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        data.isActive &&
        !Object.values(IsDriverActive).includes(data.isActive as IsDriverActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Driver isActive must be one of: ${Object.values(
            IsDriverActive
          ).join(", ")}`,
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.role === Role.ADMIN) {
      if (
        data.isActive &&
        !Object.values(IsActive).includes(data.isActive as IsActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Admin isActive must be one of: ${Object.values(
            IsAdminActive
          ).join(", ")}`,

          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
export const updateUserZodSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long." })
      .max(50, { message: "Name cannot exceed 50 characters." })
      .optional(),

    email: z
      .string()
      .email({ message: "Invalid email address format." })
      .min(5, { message: "Email must be at least 5 characters long." })
      .max(100, { message: "Email cannot exceed 100 characters." })
      .optional(),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/^(?=.*[A-Z])/, {
        message: "Password must contain at least 1 uppercase letter.",
      })
      .regex(/^(?=.*[!@#$%^&*])/, {
        message: "Password must contain at least 1 special character.",
      })
      .regex(/^(?=.*\d)/, {
        message: "Password must contain at least 1 number.",
      })
      .optional(),

    phone: z
      .string()
      .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message:
          "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
      })
      .optional(),

    address: z
      .string()
      .max(200, { message: "Address cannot exceed 200 characters." })
      .optional(),

    role: z.enum(Object.values(Role)).optional(),

    auths: z
      .array(
        z.object({
          provider: z.enum(["google", "credentials"]),
          providerId: z.string().min(1, { message: "Provider ID is required" }),
        })
      )
      .optional(),

    isActive: z.string().optional(),
    isOnline: z.boolean().optional(),
    vehicle: z
      .object({
        type: z.string(),
        number: z.string(),
        model: z.string(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === Role.RIDER) {
      if (
        data.isActive &&
        !Object.values(IsActive).includes(data.isActive as IsActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Rider isActive must be one of: ${Object.values(
            IsActive
          ).join(", ")}`,
          code: z.ZodIssueCode.custom,
        });
      }
      if (data.vehicle) {
        ctx.addIssue({
          path: ["vehicle"],
          message: "Rider should not have a vehicle",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.role === Role.DRIVER) {
      if (
        !data.vehicle ||
        !data.vehicle.type ||
        !data.vehicle.number ||
        !data.vehicle.model
      ) {
        ctx.addIssue({
          path: ["vehicle"],
          message: "Vehicle must have type, number, and model for drivers",
          code: z.ZodIssueCode.custom,
        });
      }
      if (
        data.isActive &&
        !Object.values(IsDriverActive).includes(data.isActive as IsDriverActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Driver isActive must be one of: ${Object.values(
            IsDriverActive
          ).join(", ")}`,
          code: z.ZodIssueCode.custom,
        });
      }
    }

    if (data.role === Role.ADMIN) {
      if (
        data.isActive &&
        !Object.values(IsAdminActive).includes(data.isActive as IsAdminActive)
      ) {
        ctx.addIssue({
          path: ["isActive"],
          message: `Admin isActive must be one of: ${Object.values(
            IsAdminActive
          ).join(", ")}`,
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
