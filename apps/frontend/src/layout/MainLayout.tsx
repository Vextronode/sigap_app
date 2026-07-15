import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";

export const MainLayout = () => {
  const { data } = useDashboardData();

  return (
    <div className="app-shell">
      <Sidebar alert={data?.alert} />
      <div className="app-shell__content">
        <TopNavbar alert={data?.alert} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
        <MobileNav />
      </div>
    </div>
  );
};
