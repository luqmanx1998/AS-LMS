import EmpSidebar from "../ui/EmpSidebar";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { getLeavesByEmployee } from "../functions/getLeaveData";
import { useQuery } from "@tanstack/react-query";
import EmpResetPasswordModal from "../ui/EmpResetPasswordModal";
import { useState } from "react";

function EmpDashboard() {
  const [openResetModal, setOpenResetModal] = useState(false);

  // ✅ Fetch current employee
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

  // ✅ Fetch latest leave (only when employee is available)
  const {
    data: leaves = [],
    isLoading: isLeavesLoading,
  } = useQuery({
    queryKey: ["employeeLeaves", employee?.id],
    queryFn: () => getLeavesByEmployee(employee.id),
    enabled: !!employee, // 🔥 ensures it only runs when employee.id exists
    staleTime: 2 * 60 * 1000,
  });

  if (isEmpLoading || isLeavesLoading) return <p>Loading dashboard...</p>;
  if (!employee) return <p>Employee not found.</p>;

  const totalLeaves = employee.total_leaves || {
    annualLeave: { remaining: 0, used: 0 },
  };

  const latestLeave = leaves[0]; // ✅ first one is latest

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="subheading-custom-1">
            Good morning, {employee.full_name}
          </h2>
          <button
            className="pink-button mt-2 body-2"
            onClick={() => setOpenResetModal(true)}
          >
            Reset Password
          </button>
        </div>

        {openResetModal && (
          <EmpResetPasswordModal onClose={() => setOpenResetModal(false)} />
        )}

        {/* 🧩 Dynamic leave cards */}
        {Object.entries(totalLeaves).map(([type, stats]) => (
          <div
            key={type}
            className="rounded-2xl border-[#DFE4EA] border-[1px] p-4"
          >
            <h3 className="body-1 mb-4 capitalize">
              {type.replace(/([A-Z])/g, " $1")}
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

        {/* 🧾 Latest Application */}
        <div className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4">
          <h3 className="subheading-custom-2">Latest Application</h3>

          {latestLeave ? (
            <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-2 space-y-2 flex flex-col items-start">
              <h3 className="body-1">
                {latestLeave.leave_type} Leave
              </h3>
              <span className="body-1 text-[#4A4A4A]">
                {new Date(latestLeave.start_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                -{" "}
                {new Date(latestLeave.end_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                className={`w-full text-white rounded-lg py-2 body-2 cursor-pointer ${
                  latestLeave.status === "Approved"
                    ? "bg-[#03BC66]"
                    : latestLeave.status === "Rejected"
                    ? "bg-[#E57373]"
                    : "bg-[#E7AE40]"
                }`}
              >
                {latestLeave.status}
              </button>

              <span className="text-xs text-[#4A4A4A]">
                Submitted on{" "}
                {new Date(latestLeave.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          ) : (
            <p className="body-2 text-[#4A4A4A]">
              You haven’t submitted any leave applications yet.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default EmpDashboard;
