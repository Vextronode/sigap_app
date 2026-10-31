import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layout/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AlertVerificationPage from "../pages/AlertVerificationPage";
import EmergencyContactsAdminPage from "../pages/EmergencyContactsAdminPage";
import EvacuationPointsAdminPage from "../pages/EvacuationPointsAdminPage";
import PreparednessGuidesAdminPage from "../pages/PreparednessGuidesAdminPage";
import SirenIotControlPage from "../pages/SirenIotControlPage";
import SystemSettingsPage from "../pages/SystemSettingsPage";
import UserManagementPage from "../pages/UserManagementPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      // Rute terproteksi khusus admin (wajib sesi aktif dan token valid)
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "/admin/alerts",
            element: <AlertVerificationPage />,
          },
          {
            path: "/admin/kontak-darurat",
            element: <EmergencyContactsAdminPage />,
          },
          {
            path: "/admin/titik-evakuasi",
            element: <EvacuationPointsAdminPage />,
          },
          {
            path: "/admin/panduan-kesiapsiagaan",
            element: <PreparednessGuidesAdminPage />,
          },
          {
            path: "/admin/sirine-iot",
            element: <SirenIotControlPage />,
          },
          {
            path: "/admin/manajemen-akun",
            element: <UserManagementPage />,
          },
          {
            path: "/admin/pengaturan-sistem",
            element: <SystemSettingsPage />,
          },
        ],
      },
    ],
  },
  // rute login khusus pengguna yang belum terautentikasi
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/admin/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
