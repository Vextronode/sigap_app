import { Router, type Request, type Response } from "express";
import { EarthquakeService } from "../services/earthquake.service.js";
import type { ApiErrorResponse, ApiSuccessResponse } from "../types/weather.types.js";
import type { EarthquakeInfo } from "../types/earthquake.types.js";

export const publicEarthquakesRouter = Router();

type EarthquakeHandlerOptions = {
  message: string;
  emptyMessage?: string;
  fetcher: () => Promise<EarthquakeInfo | null> | Promise<EarthquakeInfo>;
};

const buildResponse = async ({ message, emptyMessage, fetcher }: EarthquakeHandlerOptions, res: Response) => {
  try {
    const data = await fetcher();

    const response: ApiSuccessResponse<EarthquakeInfo | null> = {
      success: true,
      message: data ? message : emptyMessage ?? message,
      data,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("[GET /earthquakes] error:", error);

    const response: ApiErrorResponse = {
      success: false,
      message: "Gagal mengambil data gempa BMKG",
      errors: [error instanceof Error ? error.message : String(error)],
    };

    return res.status(502).json(response);
  }
};

const handleIndonesiaEarthquake = async (_req: Request, res: Response) =>
  buildResponse(
    {
      message: "Indonesia earthquake retrieved successfully.",
      fetcher: () => EarthquakeService.getIndonesia(),
    },
    res
  );

const handleWestJavaEarthquake = async (_req: Request, res: Response) =>
  buildResponse(
    {
      message: "West Java earthquake retrieved successfully.",
      emptyMessage: "Tidak ditemukan gempa Jawa Barat pada daftar BMKG terbaru.",
      fetcher: () => EarthquakeService.getWestJava(),
    },
    res
  );

const handlePangandaranEarthquake = async (
  req: Request,
  res: Response,
  forceHistory = false
) => {
  const isHistory = forceHistory || req.query.history === "true";
  return buildResponse(
    {
      message: isHistory
        ? "Pangandaran historical earthquake retrieved successfully."
        : "Pangandaran earthquake retrieved successfully.",
      emptyMessage:
        "Tidak ditemukan gempa Pangandaran atau wilayah sekitar pada daftar BMKG terbaru.",
      fetcher: () => EarthquakeService.getPangandaran(isHistory),
    },
    res
  );
};

/** GET /api/public/earthquakes/indonesia */
publicEarthquakesRouter.get("/indonesia", handleIndonesiaEarthquake);

/** GET /api/public/earthquakes/west-java */
publicEarthquakesRouter.get("/west-java", handleWestJavaEarthquake);

/** GET /api/public/earthquakes/pangandaran/history */
publicEarthquakesRouter.get("/pangandaran/history", (req, res) =>
  handlePangandaranEarthquake(req, res, true)
);

/** GET /api/public/earthquakes/pangandaran */
publicEarthquakesRouter.get("/pangandaran", (req, res) =>
  handlePangandaranEarthquake(req, res, false)
);

/** Alias lama untuk kompatibilitas */
publicEarthquakesRouter.get("/latest", handleIndonesiaEarthquake);
publicEarthquakesRouter.get("/", handleIndonesiaEarthquake);
