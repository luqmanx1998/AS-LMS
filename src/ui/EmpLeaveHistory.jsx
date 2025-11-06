import { useQuery } from "@tanstack/react-query";
import { getLeaveData } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";

function EmpLeaveHistory() {
  // ✅ 1. Get current employee
  const {
    data: employee,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000,
  });

  // ✅ 2. Get all leaves
 const {
  data: leaves = [],
  isLoading: isLeavesLoading,
  isError: isLeavesError,
} = useQuery({
  queryKey: ["leaves"],
  queryFn: getLeaveData, // Now returns just the array
  staleTime: 5 * 60 * 1000,
});


  // ✅ 3. Filter only current employee’s leaves
  const employeeLeaves = employee
    ? leaves.filter((leave) => leave.employee_id === employee.id)
    : [];

  // ✅ 4. Handle loading/error states
  if (isEmployeeLoading || isLeavesLoading)
    return <p>Loading leave history...</p>;
  if (isEmployeeError || isLeavesError)
    return <p>Error loading leave history.</p>;

  // ✅ 5. Helper: format dates nicely
  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-SG", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-SG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <div>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>

        {/* Table Header */}
        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
          <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
            <div className="grid grid-cols-4 w-[490px] justify-items-center items-center">
              <span className="body-2 font-medium">Leave Type</span>
              <span className="body-2 font-medium">Dates</span>
              <span className="body-2 font-medium">Status</span>
              <span className="body-2 font-medium">Remarks</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="px-4 py-2 overflow-scroll space-y-2">
            {employeeLeaves.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-2">
                No leave applications yet.
              </p>
            ) : (
              employeeLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="grid grid-cols-4 w-[490px] justify-items-center items-center gap-3 border-b border-[#F0F0F0] pb-2"
                >
                  <span className="body-2">{leave.leave_type}</span>
                  <span className="body-2">
                    {formatDateRange(leave.start_date, leave.end_date)}
                  </span>
                  <span
                    className={`body-2 rounded-2xl text-white py-1 px-2 ${
                      leave.status === "Approved"
                        ? "bg-[#03BC66]"
                        : leave.status === "Pending"
                        ? "bg-[#F3C252]"
                        : "bg-[#E57373]"
                    }`}
                  >
                    {leave.status}
                  </span>
                  <span className="body-2">
                    {leave.remarks || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpLeaveHistory;
