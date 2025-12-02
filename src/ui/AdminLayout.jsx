import { Outlet, useLocation } from "react-router";
import AdminSidebar from "./AdminSidebar";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";

function AdminLayout({ adminSidebarOpen, setAdminSidebarOpen }) {
  const location = useLocation();
  const menuBtnRef = useRef(null);

  const {
    data: admin,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // ✅ Close sidebar when route changes or on first mount
  useEffect(() => {
    setAdminSidebarOpen(false);
  }, [location.pathname, setAdminSidebarOpen]);

  const getActiveLabel = () => {
    if (!admin) return "";

    if (location.pathname === "/admin") return `${admin.full_name}'s Dashboard`;
    if (location.pathname === "/admin/leaveapps") return "Leave Applications";
    if (location.pathname === "/admin/userlist") return "User List";
    if (location.pathname === "/admin/adminleave") return "My Leave";
    return "";
  };

  return (
    <div className="relative">
      {adminSidebarOpen && (
        <AdminSidebar
          setAdminSidebarOpen={setAdminSidebarOpen}
          menuBtnRef={menuBtnRef}
          variant="mobile"
        />
      )}
      <AdminSidebar variant="desktop" />
      <nav className="flex items-center justify-between mb-4 lg:hidden">
        <h1 className="heading-custom-2">{getActiveLabel()}</h1>
        <div
          ref={menuBtnRef}
          className="p-3 bg-[#F6F6F6] rounded-full cursor-pointer"
          onClick={() => setAdminSidebarOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer"
          >
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

export default AdminLayout;
