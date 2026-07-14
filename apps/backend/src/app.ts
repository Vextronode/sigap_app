import express, { Request, Response, NextFunction } from "express";
import { publicRouter, protectedRouter } from "./routes/index.js";

const app = express();

app.use(express.json());

app.use("/api/public", publicRouter);
app.use("/api/protected", protectedRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan.",
    errors: {},
  });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
    errors: {},
  });
});

export default app;