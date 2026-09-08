import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { Footer } from "./Footer";
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";

export const MainLayout = () => {
  const alertQuery = useCurrentAlert();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__content">
        <TopNavbar
          alert={alertQuery.data ?? null}
          isLoading={alertQuery.isLoading}
          isError={alertQuery.isError}
        />
        <main className={`main-content ${isAdminRoute ? "main-content--admin" : ""}`}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
