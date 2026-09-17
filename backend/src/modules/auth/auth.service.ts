import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { users } from "../../db/schema/index.js";
import { createAccessToken } from "./auth.token.js";

export interface RegisterUserInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  preferredLanguage: "en" | "yo" | "pcm" | "fr";
}

export async function registerUser(input: RegisterUserInput) {
  const existingPhone = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.phone, input.phone))
    .limit(1);

  if (existingPhone.length > 0) {
    throw new Error("PHONE_ALREADY_EXISTS");
  }

  if (input.email) {
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingEmail.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const [user] = await db
    .insert(users)
    .values({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      passwordHash,
      preferredLanguage: input.preferredLanguage,
    })
    .returning({
      id: users.id,
      fullName: users.fullName,
      phone: users.phone,
      email: users.email,
      role: users.role,
      preferredLanguage: users.preferredLanguage,
      isActive: users.isActive,
      createdAt: users.createdAt,
    });

  return user; 
}

export async function loginUser(email: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash ?? "");

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = createAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      isActive: user.isActive,
    },
  };
}