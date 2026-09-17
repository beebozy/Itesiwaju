// src/db/client.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../config/env.js"; // adjust path to wherever your env.ts actually lives
import * as schema from "./schema/index.js";
const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, {schema});