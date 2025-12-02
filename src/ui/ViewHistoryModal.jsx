import { useQuery } from "@tanstack/react-query";
import { getLeavesByEmployee } from "../functions/getLeaveData";
import LoadingSpinner from "./LoadingSpinner";

function ViewHistoryModal({ employee, onClose }) {
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves", employee.id],
    queryFn: () => getLeavesByEmployee(employee.id),
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] z-[100] flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="subheading-custom-2">
            Leave History – {employee.full_name}
          </h2>
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
            onClick={onClose}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
              <LoadingSpinner message="Loading leave history..." />
          ) : leaves.length === 0 ? (
            <p className="text-sm text-[#7F8184] text-center">
              No leave history found.
            </p>
          ) : (
            leaves.map((leave) => (
              <div
                key={leave.id}
                className="border border-[#DFE4EA] rounded-lg p-3 flex flex-col gap-1"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{leave.leave_type}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      leave.status === "Approved"
                        ? "bg-[#D4FDE5] text-[#02864A]"
                        : leave.status === "Rejected"
                        ? "bg-[#FFD5D5] text-[#C62828]"
                        : "bg-[#FFF2C6] text-[#856404]"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
                <p className="text-sm text-[#4A4A4A]">
                  {leave.start_date} → {leave.end_date}
                </p>
                <p className="text-xs text-[#7F8184]">
                  Submitted on {new Date(leave.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewHistoryModal;