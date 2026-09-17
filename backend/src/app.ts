import express from "express";
import cors from "cors";
import helmet from "helmet";

import { reportsRouter } from "./modules/reports/reports.route.js";

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