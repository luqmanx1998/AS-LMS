import { Outlet, useLocation } from "react-router"
import EmpSidebar from "./EmpSidebar"

function EmployeeLayout( {empSidebarOpen, setEmpSidebarOpen} ) {
  const location = useLocation();

  const getActiveLabel = () => {
    if (location.pathname === "/employee") return "Dashboard";
    if (location.pathname === "/employee/empleaves") return "My Leave";
    if (location.pathname === "/employee/empleavehist") return "My Leave History";
    return "";
  };

  return (
    <div>
        {empSidebarOpen && <EmpSidebar />}
        <nav className="flex items-center justify-between mb-4">
        <h1 className="heading-custom-2">{getActiveLabel()}</h1> 
        <div className="p-3 bg-[#F6F6F6] rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu" className="cursor-pointer"
          onClick={() => setEmpSidebarOpen((prev) => !prev)}><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default EmployeeLayout
