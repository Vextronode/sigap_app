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

// ==== TEMPORARY DEBUG — HAPUS SETELAH SELESAI CEK ====
app.get("/api/debug-env", (req: Request, res: Response) => {
  const url = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";
  res.json({
    database_url: {
      exists: !!url,
      length: url.length,
      hasNeonHost: url.includes("neon.tech"),
      hasPooler: url.includes("-pooler"),
    },
    direct_url: {
      exists: !!directUrl,
      length: directUrl.length,
    },
    node_env: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV,
  });
});
// ==== END TEMPORARY DEBUG ====

app.use("/api/v1/public", publicRouter);
app.use("/api/v1/protected", protectedRouter);

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