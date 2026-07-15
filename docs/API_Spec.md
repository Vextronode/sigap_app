# API_SPEC.md

> SIGAP API Specification

Version 2.0

By: Naufal Fadhiil

Last Updated: 14 July 2026
---

# 1. Purpose

This document defines the REST API contract between the frontend and backend.

Its purpose is to ensure that frontend developers, backend developers, QA engineers, and AI coding agents share the same understanding of every API endpoint.

This document describes:

- Endpoint URL
- HTTP Method
- Authentication
- Request Format
- Response Format
- Error Response

Implementation details are intentionally excluded.

---

# 2. Base URL

Development

```
http://localhost:3000/api/v1
```

Production

```
https://api.sigap.id/api/v1
```

Every endpoint should begin with:

```
/api/v1
```

Future API versions should use:

```
/api/v2
```

---

# 3. Authentication

SIGAP uses JWT Authentication for protected endpoints.

Public endpoints do not require authentication.

Protected endpoints require:

```
Authorization: Bearer <token>
```

If authentication fails:

```
401 Unauthorized
```

If authorization fails:

```
403 Forbidden
```

---

# 4. Standard Success Response

Every successful response should follow this structure.

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

---

# 5. Standard Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

---

# 6. HTTP Status Codes

| Status | Meaning |
|---------|---------|
| 200 | Success |
| 201 | Resource Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# 7. API Categories

The API is divided into two groups.

Public APIs

- Weather
- Forecast
- Earthquake
- Tsunami
- Alert Status
- AI Summary
- Announcements
- Emergency Contacts
- Evacuation

Protected APIs

- Authentication
- Dashboard
- Broadcast
- Alert Validation
- Announcement Management
- Emergency Contact Management
- Evacuation Management

---

## Dashboard Aggregation API

Untuk meningkatkan performa website, frontend **tidak mengambil seluruh data satu per satu** ketika halaman utama dibuka.

Sebagai gantinya backend menyediakan satu endpoint agregasi yang menggabungkan seluruh data utama dashboard dalam satu response.

Endpoint ini akan mengambil data dari:

- Current Weather
- Weather Forecast
- Latest Earthquake
- Tsunami Status
- Current Alert
- AI Weather Summary
- Latest Announcement
- Emergency Contacts
- Evacuation Points

Sehingga frontend hanya membutuhkan **satu request** untuk menampilkan seluruh halaman dashboard.

---

# 8.0 Get Dashboard Data

Mengambil seluruh data utama Dashboard SIGAP dalam satu request.

## Endpoint

```http
GET /dashboard
```

Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully.",
  "data": {
    "weather": {},
    "forecast": [],
    "earthquake": {},
    "tsunami": {},
    "alert": {},
    "summary": {},
    "announcement": [],
    "contacts": [],
    "evacuation": []
  }
}
```

---

# 8.1 Get Current Weather

Mengambil informasi cuaca terkini untuk Desa Cibenda.

## Endpoint

```http
GET /weather/current
```

## Authentication

Tidak diperlukan.

## Query Parameters

| Parameter | Type | Required | Description |
|----------|------|----------|-------------|
| village | string | No | Default: cibenda |

## Success Response

```json
{
  "success": true,
  "message": "Current weather retrieved successfully.",
  "data": {
    "temperature": 29,
    "humidity": 82,
    "weather": "Hujan Ringan",
    "windSpeed": 18,
    "windDirection": "Barat Laut",
    "visibility": "10 km",
    "updatedAt": "2026-07-08T14:00:00Z"
  }
}
```

### BMKG Mapping

Response ini berasal dari endpoint:

```
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=32.18.01.2008
```

Field yang digunakan:

- t
- hu
- weather_desc
- ws
- wd
- vs_text
- local_datetime


---

# 8.2 Get Weather Forecast

Mengambil prakiraan cuaca beberapa hari ke depan.

## Endpoint

```http
GET /weather/forecast
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Forecast retrieved successfully.",
  "data": [
    {
      "date": "2026-07-09",
      "condition": "Rain",
      "temperature": 28,
      "rainProbability": 80
    },
    {
      "date": "2026-07-10",
      "condition": "Cloudy",
      "temperature": 30,
      "rainProbability": 40
    }
  ]
}
```

### Catatan

Backend mengambil data prakiraan BMKG selama **3 hari** dengan interval **3 jam**.

Frontend dapat memilih data mana yang akan ditampilkan (misalnya hanya pagi, siang, sore, malam).

---

# 8.3 Get Latest Earthquake

Mengambil informasi gempa terbaru dari BMKG.

## Endpoint

```http
GET /earthquakes/latest
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Latest earthquake retrieved successfully.",
  "data": {
    "magnitude": 5.6,
    "depth": "18 km",
    "location": "Selatan Pangandaran",
    "coordinates": {
      "latitude": -7.12,
      "longitude": 108.42
    },
    "distanceToVillage": 82,
    "felt": "II Pangandaran",
    "potential": "Tidak berpotensi tsunami",
    "shakemap": "https://static.bmkg.go.id/xxxxx.jpg",
    "updatedAt": "2026-07-08T14:15:00Z"
  }
}
```

### BMKG Mapping

Data berasal dari:

```
https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json
```

Field yang digunakan:

- Magnitude
- Kedalaman
- Coordinates
- Wilayah
- Potensi
- Dirasakan
- Shakemap

Field `distanceToVillage` dihitung oleh backend menggunakan koordinat Desa Cibenda.


---

# 8.4 Get Tsunami Status

Mengambil status tsunami terbaru.

## Endpoint

```http
GET /tsunamis/status
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Tsunami status retrieved successfully.",
  "data": {
    "status": "NORMAL",
    "warningLevel": "None",
    "source": "BMKG InaTEWS",
    "updatedAt": "2026-07-08T14:20:00Z"
  }
}
```

### Data Source

Status tsunami mengikuti informasi resmi BMKG InaTEWS.

SIGAP tidak melakukan prediksi tsunami secara mandiri.

---

# 8.5 Get Current Alert

Mengambil status kesiapsiagaan SIGAP.

Status ditentukan berdasarkan Alert Rules.

## Endpoint

```http
GET /alerts/current
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Current alert retrieved successfully.",
  "data": {
    "level": "WASPADA",
    "color": "yellow",
    "reason": "Gempa Magnitudo 5.2 dalam radius 120 km.",
    "generatedBy":"Decision Engine",
    "validated":false
    "lastUpdated": "2026-07-08T14:30:00Z"
  }
}
```

---

# 8.6 Get AI Weather Summary

Mengambil ringkasan cuaca yang telah diproses AI.

## Endpoint

```http
GET /summaries/weather
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Weather summary generated successfully.",
  "data": {
    "summary": "Hari ini diperkirakan hujan sedang pada sore hari. Hindari aktivitas di sekitar pantai apabila hujan disertai angin kencang."
  }
}
```

---

# 8.7 Get Announcements

Mengambil seluruh pengumuman aktif.

## Endpoint

```http
GET /announcements
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Announcements retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Simulasi Evakuasi Tsunami",
      "publishedAt": "2026-07-08",
      "priority": "HIGH"
    }
  ]
}
```

---

# 8.8 Get Emergency Contacts

Mengambil daftar kontak darurat.

## Endpoint

```http
GET /emergency-contacts
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Emergency contacts retrieved successfully.",
  "data": [
    {
      "institution": "BPBD Pangandaran",
      "phone": "119"
    },
    {
      "institution": "Puskesmas",
      "phone": "0265-xxxxxx"
    }
  ]
}
```

---

# 8.9 Get Evacuation Points

Mengambil seluruh titik evakuasi.

## Endpoint

```http
GET /evacuation-points
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Evacuation points retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Lapangan Desa",
      "latitude": -7.68,
      "longitude": 108.65
    }
  ]
}
```

---

# 8.10 Get Evacuation Routes

Mengambil seluruh jalur evakuasi.

## Endpoint

```http
GET /evacuation-routes
```

## Authentication

Tidak diperlukan.

## Success Response

```json
{
  "success": true,
  "message": "Evacuation routes retrieved successfully.",
  "data": [
    {
      "id": 1,
      "routeName": "Pantai → Lapangan Desa",
      "geometry": {}
    }
  ]
}
```

---

# 9. Protected APIs

Endpoint berikut hanya dapat diakses oleh pengguna yang telah login menggunakan JWT.

## Authentication

### POST /auth/login

Digunakan untuk login admin SIGAP.

---

## Alert Validation

### POST /alerts/validate

Digunakan oleh Admin Dashboard untuk melakukan validasi terhadap alert yang dikirim oleh Decision Engine sebelum proses broadcast dilanjutkan.

---

## Alert History

### GET /alerts/history

Mengambil riwayat alert yang pernah terjadi.

---

## Dashboard Admin

### GET /admin/dashboard

Mengambil ringkasan statistik Dashboard Admin.

---

## Announcement Management

- POST /announcements
- PUT /announcements/{id}
- DELETE /announcements/{id}

---

## Emergency Contact Management

- POST /emergency-contacts
- PUT /emergency-contacts/{id}
- DELETE /emergency-contacts/{id}

---

## Evacuation Management

- POST /evacuation-points
- PUT /evacuation-points/{id}
- DELETE /evacuation-points/{id}

---

# Future APIs

Endpoint berikut **tidak termasuk MVP**, namun telah dipersiapkan untuk pengembangan berikutnya.

## IoT Event

```http
POST /iot/events
```

Digunakan untuk menerima event dari perangkat IoT yang dipasang di Desa Cibenda.

Payload akan berisi informasi seperti:

- deviceId
- status
- timestamp
- location

Event tersebut akan diproses oleh Decision Engine sebelum menghasilkan Alert.

---

## Broadcast Gateway

- WhatsApp Broadcast
- SMS Broadcast
- Push Notification

Endpoint akan ditambahkan setelah integrasi gateway komunikasi dilakukan.
