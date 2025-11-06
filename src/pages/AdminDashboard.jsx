import { useQuery } from "@tanstack/react-query";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { getLeaveData } from "../functions/getLeaveData";
import Calendar from "../ui/Calendar";
import { Link } from "react-router";

function AdminDashboard() {
  // ✅ Fetch current admin data
  const {
    data: admin,
    isLoading: isAdminLoading,
    isError: isAdminError,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // ✅ Fetch all leaves - handle both possible return formats
  const {
    data: leavesResponse,
    isLoading: isLeavesLoading,
    isError: isLeavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: getLeaveData,
    staleTime: 5 * 60 * 1000,
  });

  // Debug what we're getting
  console.log('🔍 AdminDashboard leavesResponse:', leavesResponse);

  if (isAdminLoading || isLeavesLoading)
    return <p>Loading dashboard...</p>;
  if (isAdminError) return <p>Error loading admin data.</p>;
  if (!admin) return <p>Admin not found.</p>;

  const totalLeaves = admin.total_leaves || {
    annualLeave: { remaining: 0, used: 0 },
    medicalLeave: { remaining: 0, used: 0 },
  };

  // ✅ Handle both array and object response formats
  const leaves = Array.isArray(leavesResponse) 
    ? leavesResponse 
    : (leavesResponse?.leaves || []);
  
  console.log('🔍 Processed leaves:', leaves);

  // ✅ Get the latest leave application
  const latestLeave = leaves?.[0] || null;

  console.log('🔍 Latest leave:', latestLeave);

  // Helper for title casing leave type
  const formatLeaveType = (type) =>
    type.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Calendar />

      {/* 🧾 Latest Leave Application */}
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 mb-4">
        <h1 className="subheading-custom-1 pb-4">Latest Leave Application</h1>

        {latestLeave ? (
          <div className="rounded-lg border-[#DFE4EA] border-[1px] px-4 py-4">
            <h1 className="subheading-custom-1 mb-2">
              {formatLeaveType(latestLeave.leave_type)} Leave
            </h1>

            {/* 🧩 Employee name and department */}
            <p className="body-2 text-[#4A4A4A] mb-4">
              <strong>{latestLeave.employees?.full_name || "Unknown Employee"}</strong>{" "}
              — {latestLeave.employees?.department
                ? latestLeave.employees.department.charAt(0).toUpperCase() +
                  latestLeave.employees.department.slice(1)
                : "N/A"}
            </p>

            <span className="body-1 font-normal pb-2 block">
              {latestLeave.start_date} - {latestLeave.end_date}
            </span>

            <Link
              to="/admin/leaveapps"
              className="flex w-full bg-[#EDCEAF] justify-center p-3 rounded-lg body-2 mt-4 mb-1 cursor-pointer hover:bg-[#e0b98d]"
            >
              Accept Review
            </Link>

            <span className="body-2 text-[#4A4A4A]">
              Submitted on{" "}
              {new Date(latestLeave.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ) : (
          <p className="body-2 text-[#4A4A4A]">No recent applications found.</p>
        )}
      </div>

      {/* 🧮 Leave Balance Section */}
      <div className="space-y-4">
        <h2 className="subheading-custom-1">Your Leave Balances</h2>
        {Object.entries(totalLeaves).map(([type, stats]) => (
          <div
            key={type}
            className="rounded-2xl border-[#DFE4EA] border-[1px] p-4"
          >
            <h3 className="body-1 mb-4 capitalize">
              {formatLeaveType(type)}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#D4FDE5] rounded-lg p-3 space-y-2">
                <p className="body-2">Remaining</p>
                <span className="body-1 font-semibold">{stats.remaining}</span>
              </div>
              <div className="bg-[#EAF1FF] rounded-lg p-3 space-y-2">
                <p className="body-2">Used</p>
                <span className="body-1 font-semibold">{stats.used}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;