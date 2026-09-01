import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { Footer } from "./Footer";
{/*
import { MobileNav } from "./MobileNav";
*/}
import { useCurrentAlert } from "../features/dashboard/hooks/useCurrentAlert";

export const MainLayout = () => {
  const alertQuery = useCurrentAlert();

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__content">
        <TopNavbar
          alert={alertQuery.data ?? null}
          isLoading={alertQuery.isLoading}
          isError={alertQuery.isError}
        />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
        {/*
        <MobileNav />
        */}
      </div>
    </div>
  );
};
