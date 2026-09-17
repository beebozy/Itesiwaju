import express from "express";
import cors from "cors";
import helmet from "helmet";

import { reportsRouter } from "./modules/reports/reports.route.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { authTestRouter } from "./modules/auth/auth.test.route.js";


export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "itesiwoju-backend",
  });
});

app.use("/api/v1/reports", reportsRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/auth/test", authTestRouter);