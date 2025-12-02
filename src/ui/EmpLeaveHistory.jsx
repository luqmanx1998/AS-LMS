import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeaveData, cancelLeave } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import Pagination from "../ui/Pagination";
import LoadingSpinner from "./LoadingSpinner";
import { useNotification } from "../context/NotificationContext";

function EmpLeaveHistory() {
  const queryClient = useQueryClient();
  const { setPopup } = useNotification();

  const cancelMutation = useMutation({
    mutationFn: (leaveId) => cancelLeave(leaveId),
    onSuccess: () => {
      queryClient.invalidateQueries(["leaves"]);
      setPopup({
        message: "Leave cancelled successfully.",
        type: "success",
        onClose: () => setPopup(null),
      });
    },
    onError: () => {
      setPopup({
        message: "Failed to cancel leave.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  const handleCancel = (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave?")) return;
    cancelMutation.mutate(leaveId);
  };

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
    data: leavesResponse,
    isLoading: isLeavesLoading,
    isError: isLeavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: getLeaveData,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const limit = 8;

  // ✅ 3. Normalize the response format
  const getSafeLeavesArray = (response) => {
    try {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (response && typeof response === "object") {
        if (Array.isArray(response.leaves)) return response.leaves;
        if (Array.isArray(response.data)) return response.data;
        if (Array.isArray(response.result)) return response.result;
      }
      return [];
    } catch {
      return [];
    }
  };

  const leaves = getSafeLeavesArray(leavesResponse);

  // ✅ 4. Filter for the current employee’s leaves
  const employeeLeaves = useMemo(() => {
    if (!employee?.id || !Array.isArray(leaves)) return [];
    return leaves.filter((leave) => leave.employee_id === employee.id);
  }, [leaves, employee]);

  // ✅ 5. Sorting + Pagination
  const sortedLeaves = [...employeeLeaves].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const totalPages = Math.ceil(sortedLeaves.length / limit);
  const paginatedLeaves = sortedLeaves.slice(
    (page - 1) * limit,
    page * limit
  );

  // ✅ 6. Format date range helper
  const formatDateRange = (start, end) => {
    if (!start || !end) return "Invalid date range";
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      return "Invalid date";
    return `${startDate.toLocaleDateString("en-SG", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-SG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  // ✅ 7. Handle loading/error states
  if (isEmployeeLoading || isLeavesLoading) {
    return <LoadingSpinner message="Loading leave history..." />;
  }

  if (isEmployeeError || isLeavesError) {
    return (
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>
        <p className="text-red-500">Error loading leave history.</p>
      </div>
    );
  }

  // ✅ 8. Render
  return (
    <div className="lg:p-4 lg:flex lg:flex-col lg:items-center lg:w-[calc(100%-280px)]">
      <h1 className="hidden lg:block heading-custom-1 lg:w-[calc(100%-280px)] lg:translate-x-70 lg:mb-4">
        My Leave History
      </h1>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 lg:w-[calc(100%-280px)] lg:translate-x-70">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>

        {/* Table Header */}
        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
          <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
            <div className="grid grid-cols-5 w-[550px] lg:w-200 justify-items-center items-center">
              <span className="body-2 font-medium">Leave Type</span>
              <span className="body-2 font-medium">Dates</span>
              <span className="body-2 font-medium">Status</span>
              <span className="body-2 font-medium">Remarks</span>
              <span className="body-2 font-medium">Actions</span>
            </div>
          </div>

          {/* Table Rows */}
          <div className="px-4 py-2 overflow-scroll space-y-2">
            {paginatedLeaves.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-2">
                No leave applications yet.
              </p>
            ) : (
              paginatedLeaves.map((leave, index) => (
                <div
                  key={leave?.id || `leave-${index}`}
                  className="grid grid-cols-5 w-[550px] lg:w-200 justify-items-center items-center gap-3 border-b border-[#F0F0F0] pb-2"
                >
                  <span className="body-2">
                    {leave?.leave_type || "Unknown"}
                  </span>
                  <span className="body-2 text-center">
                    {formatDateRange(leave?.start_date, leave?.end_date)}
                  </span>
                  <span
                    className={`body-2 rounded-2xl text-white py-1 px-2 ${
                      leave?.status === "Approved"
                        ? "bg-[#03BC66]"
                        : leave?.status === "Pending"
                        ? "bg-[#F3C252]"
                        : leave?.status === "Cancelled"
                        ? "bg-gray-400"
                        : "bg-[#E57373]"
                    }`}
                  >
                    {leave?.status || "Unknown"}
                  </span>
                  <span className="body-2 text-center">
                    {leave?.remarks || "—"}
                  </span>

                  {/* ✅ You can change/move/style this later – logic only */}
                  <button
                    onClick={() => handleCancel(leave.id)}
                    className="px-2 py-1 rounded-2xl cursor-pointer bg-red-500 text-xs hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={leave?.status === "Approved" || leave?.status === "Rejected" || leave?.status === "Cancelled"}
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination (only visible if multiple pages) */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

export default EmpLeaveHistory;
