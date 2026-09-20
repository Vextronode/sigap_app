import type { Request, Response, NextFunction } from "express";

// validasi input pembuatan titik evakuasi
export function validateCreateEvacuationPoint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, latitude, longitude, elevation, capacity, facilities, address, description, isCore } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.name = "Nama titik evakuasi wajib diisi minimal 3 karakter.";
  }

  const lat = Number(latitude);
  if (latitude === undefined || latitude === null || isNaN(lat) || lat < -90 || lat > 90) {
    errors.latitude = "Latitude harus berupa angka valid antara -90 dan 90.";
  }

  const lng = Number(longitude);
  if (longitude === undefined || longitude === null || isNaN(lng) || lng < -180 || lng > 180) {
    errors.longitude = "Longitude harus berupa angka valid antara -180 dan 180.";
  }

  if (elevation !== undefined && elevation !== null && elevation !== "") {
    const el = Number(elevation);
    if (isNaN(el)) {
      errors.elevation = "Elevasi harus berupa angka (mdpl).";
    }
  }

  if (capacity !== undefined && capacity !== null && capacity !== "") {
    const cap = Number(capacity);
    if (isNaN(cap) || cap < 0) {
      errors.capacity = "Kapasitas harus berupa angka positif.";
    }
  }

  if (facilities !== undefined && !Array.isArray(facilities)) {
    errors.facilities = "Fasilitas harus berupa array teks.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors,
    });
  }

  next();
}

// validasi input pembaruan titik evakuasi
export function validateUpdateEvacuationPoint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, latitude, longitude, elevation, capacity, facilities } = req.body ?? {};
  const errors: Record<string, string> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 3) {
      errors.name = "Nama titik evakuasi minimal 3 karakter.";
    }
  }

  if (latitude !== undefined) {
    const lat = Number(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.latitude = "Latitude harus berupa angka valid antara -90 dan 90.";
    }
  }

  if (longitude !== undefined) {
    const lng = Number(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.longitude = "Longitude harus berupa angka valid antara -180 dan 180.";
    }
  }

  if (elevation !== undefined && elevation !== null && elevation !== "") {
    const el = Number(elevation);
    if (isNaN(el)) {
      errors.elevation = "Elevasi harus berupa angka (mdpl).";
    }
  }

  if (capacity !== undefined && capacity !== null && capacity !== "") {
    const cap = Number(capacity);
    if (isNaN(cap) || cap < 0) {
      errors.capacity = "Kapasitas harus berupa angka positif.";
    }
  }

  if (facilities !== undefined && !Array.isArray(facilities)) {
    errors.facilities = "Fasilitas harus berupa array teks.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal.",
      errors,
    });
  }

  next();
}
