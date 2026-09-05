import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { publicRouter, protectedRouter } from "./routes/index.js";

const app = express();

app.use(helmet());

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/public", publicRouter);
app.use("/api/protected", protectedRouter);
// Alias agar endpoint publik juga dapat diakses langsung via /api/... di Postman
app.use("/api", publicRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
    errors: {},
  });
});

/* Global Error Handler */
app.use(
  (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
      errors: {},
    });
  }
);

export default app;