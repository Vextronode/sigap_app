import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";

export const MainLayout = () => {
  const { data: alert } = useCurrentAlert();

  return (
    <div className="app-shell">
      <Sidebar alert={alert ?? null} />
      <div className="app-shell__content">
        <TopNavbar alert={alert ?? null} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
        <MobileNav />
      </div>
    </div>
  );
};
