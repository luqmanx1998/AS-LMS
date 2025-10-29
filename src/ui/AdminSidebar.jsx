import { Link, useLocation } from "react-router";
import supabase from "../functions/supabase";
import { useNavigate } from "react-router";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/"); // redirect to login page
    }
  }

  // Optional: highlight active menu item
  const isActive = (path) => location.pathname === path;

  return (
    <div className="shadow-lg fixed top-0 left-0 h-full w-[50%] z-[105] bg-[#F6F6F6] px-2 body-2 space-y-4">
      <p className="mt-10">Menu</p>

      {/* Dashboard */}
      <Link
        to="/admin"
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive("/admin") ? "bg-[#EDCEAF]" : "hover:bg-[#EDCEAF]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-layout-dashboard"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
        <span>Dashboard</span>
      </Link>

      {/* Leave Applications */}
      <Link
        to="/admin/leaveapps"
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive("/admin/leaveapps") ? "bg-[#EDCEAF]" : "hover:bg-[#EDCEAF]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-inbox"
        >
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        <span>Leave Applications</span>
      </Link>

      {/* User List */}
      <Link
        to="/admin/userlist"
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive("/admin/userlist") ? "bg-[#EDCEAF]" : "hover:bg-[#EDCEAF]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clipboard-list"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M12 11h4" />
          <path d="M12 16h4" />
          <path d="M8 11h.01" />
          <path d="M8 16h.01" />
        </svg>
        <span>User List</span>
      </Link>

      {/* My Leave */}
      <Link
        to="/admin/adminleave"
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive("/admin/adminleave") ? "bg-[#EDCEAF]" : "hover:bg-[#EDCEAF]"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-door-open"
        >
          <path d="M11 20H2" />
          <path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z" />
          <path d="M11 4H8a2 2 0 0 0-2 2v14" />
          <path d="M14 12h.01" />
          <path d="M22 20h-3" />
        </svg>
        <span>My Leave</span>
      </Link>

      {/* Sign Out */}
      <div
        onClick={handleSignOut} // replace with your signout logic
        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-[#EDCEAF] transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-door-open"
        >
          <path d="M11 20H2" />
          <path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z" />
          <path d="M11 4H8a2 2 0 0 0-2 2v14" />
          <path d="M14 12h.01" />
          <path d="M22 20h-3" />
        </svg>
        <span>Sign Out</span>
      </div>
    </div>
  );
}

export default AdminSidebar;
