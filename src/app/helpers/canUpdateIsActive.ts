import {
  IsActive,
  IsAdminActive,
  IsDriverActive,
  Role,
} from "../modules/user/user.interface";

export const canUpdateStatus = (
  role: Role,
  newStatus: IsActive | IsAdminActive | IsDriverActive
): true | string => {
  if (role === Role.RIDER) {
    // Rider can only switch between ACTIVE and INACTIVE
    const allowed = [IsActive.ACTIVE, IsActive.INACTIVE];
    if (allowed.includes(newStatus as IsActive)) {
      return true;
    }
    return "Rider can only update status to ACTIVE or INACTIVE.";
  }

  if (role === Role.DRIVER) {
    // Driver can only REQUEST or set INACTIVE
    const allowed = [IsDriverActive.REQUESTED, IsDriverActive.INACTIVE];
    if (allowed.includes(newStatus as IsDriverActive)) {
      return true;
    }
    return "Driver can only update status to REQUESTED or INACTIVE.";
  }

  if (role === Role.ADMIN) {
    // Admin can update to anything from all enums
    const allStatuses = [
      ...Object.values(IsActive),
      ...Object.values(IsDriverActive),
      ...Object.values(IsAdminActive),
    ];
    if (allStatuses.includes(newStatus)) {
      return true;
    }
    return "Invalid status value for Admin.";
  }

  return "Unknown role.";
};
