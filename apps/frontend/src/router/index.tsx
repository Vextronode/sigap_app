import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "../layout/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import AlertVerificationPage from "../pages/AlertVerificationPage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import { GuestRoute } from "./GuestRoute";

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
      {
        path: "/admin/dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "/admin/alerts",
        element: <AlertVerificationPage />,
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
