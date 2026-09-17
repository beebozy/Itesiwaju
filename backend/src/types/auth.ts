export const USER_ROLES = [
  "CITIZEN",
  "PSP_OPERATOR",
  "AGENCY_OPERATOR",
  "COLLECTOR",
  "ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];