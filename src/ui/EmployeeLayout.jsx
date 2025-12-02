import { Outlet, useLocation } from "react-router";
import EmpSidebar from "./EmpSidebar";
import { useQuery } from "@tanstack/react-query";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { useEffect, useRef } from "react";

function EmployeeLayout({ empSidebarOpen, setEmpSidebarOpen }) {
  const location = useLocation();
  const menuBtnRef = useRef(null);

    // ✅ Close sidebar when route changes or on first mount
    useEffect(() => {
      setEmpSidebarOpen(false);
    }, [location.pathname, setEmpSidebarOpen]);

  const {
    data: employee,
    isLoading: isEmpLoading,
    isError: isEmpError,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const getActiveLabel = () => {
    if (!employee) return "";

    if (location.pathname === "/employee")
      return `${employee.full_name}'s Dashboard`;
    if (location.pathname === "/employee/empleaves") return "My Leave";
    if (location.pathname === "/employee/empleavehist") return "My Leave History";
    return "";
  };

  return (
    <div className="relative">
      {empSidebarOpen && (
        <EmpSidebar
          setEmpSidebarOpen={setEmpSidebarOpen}
          menuBtnRef={menuBtnRef}
          variant="mobile"
        />
      )}

      <EmpSidebar 
      setEmpSidebarOpen={setEmpSidebarOpen}
      menuBtnRef={menuBtnRef}
      variant="desktop"/>

      <nav className="flex items-center justify-between mb-4 lg:hidden">
        <h1 className="heading-custom-2">{getActiveLabel()}</h1>
        <div
          ref={menuBtnRef}
          className="p-3 bg-[#F6F6F6] rounded-full cursor-pointer"
          onClick={() => setEmpSidebarOpen((prev) => !prev)}
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

export default EmployeeLayout;
