import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { environmentalDataRouter } from "./routes/environmentalData.routes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Route testing sementara — lihat catatan di environmentalData.routes.ts
app.use("/api/public/environmental-data", environmentalDataRouter);

app.listen(PORT, () => {
  console.log(`SIGAP backend running on port ${PORT}`);
});
