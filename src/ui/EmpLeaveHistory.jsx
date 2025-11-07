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

  // ✅ 2. Get all leaves - with enhanced error handling
  const {
    data: leavesResponse,
    isLoading: isLeavesLoading,
    isError: isLeavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: getLeaveData,
    staleTime: 5 * 60 * 1000,
    retry: 2, // Add retries for network issues
  });

  // ✅ ULTRA DEFENSIVE: Handle absolutely any response format
  const getSafeLeavesArray = (response) => {
    try {
      console.log("🔍 Raw leavesResponse:", response);
      console.log("🔍 Type of leavesResponse:", typeof response);
      
      // If response is falsy (null, undefined, false, 0, "", etc.)
      if (!response) {
        console.log("🔍 Response is falsy, returning empty array");
        return [];
      }
      
      // If it's already an array, return it
      if (Array.isArray(response)) {
        console.log("🔍 Response is array, length:", response.length);
        return response;
      }
      
      // If it's an object, check for common properties
      if (response && typeof response === 'object') {
        if (Array.isArray(response.leaves)) {
          console.log("🔍 Response has leaves array, length:", response.leaves.length);
          return response.leaves;
        }
        if (Array.isArray(response.data)) {
          console.log("🔍 Response has data array, length:", response.data.length);
          return response.data;
        }
        if (Array.isArray(response.result)) {
          console.log("🔍 Response has result array, length:", response.result.length);
          return response.result;
        }
        
        // Log the object structure to help debug
        console.log("🔍 Object keys:", Object.keys(response));
        console.log("🔍 Full object:", response);
      }
      
      // If we get here, it's an unexpected format
      console.warn("⚠️ Unexpected leaves response format, returning empty array. Response:", response);
      return [];
    } catch (error) {
      console.error("💥 Error processing leaves response:", error);
      return [];
    }
  };

  const leaves = getSafeLeavesArray(leavesResponse);

  // ✅ SUPER SAFE filtering with multiple checks
  const getEmployeeLeaves = (leavesArray, emp) => {
    try {
      // Multiple safety checks
      if (!emp || !emp.id) {
        console.log("🔍 No employee or employee id");
        return [];
      }
      
      if (!Array.isArray(leavesArray)) {
        console.log("🔍 leavesArray is not an array:", typeof leavesArray);
        return [];
      }
      
      console.log("🔍 Filtering leaves for employee:", emp.id);
      console.log("🔍 Total leaves to filter:", leavesArray.length);
      
      const filtered = leavesArray.filter(leave => {
        // Multiple checks for each leave object
        if (!leave) return false;
        if (typeof leave !== 'object') return false;
        if (!leave.employee_id) return false;
        
        return leave.employee_id === emp.id;
      });
      
      console.log("🔍 Filtered leaves count:", filtered.length);
      return filtered;
    } catch (filterError) {
      console.error("💥 Error filtering leaves:", filterError);
      return [];
    }
  };

  const employeeLeaves = getEmployeeLeaves(leaves, employee);

  // ✅ 4. Handle loading/error states
  if (isEmployeeLoading || isLeavesLoading) {
    return (
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>
        <p>Loading leave history...</p>
      </div>
    );
  }
  
  if (isEmployeeError || isLeavesError) {
    return (
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>
        <p className="text-red-500">Error loading leave history.</p>
      </div>
    );
  }

  // ✅ 5. Helper: format dates nicely with error handling
  const formatDateRange = (start, end) => {
    try {
      if (!start || !end) return "Invalid date range";
      
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "Invalid date";
      }
      
      return `${startDate.toLocaleDateString("en-SG", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-SG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date error";
    }
  };

  // ✅ Final safety check before rendering
  if (!Array.isArray(employeeLeaves)) {
    console.error("💥 employeeLeaves is not an array after all processing:", employeeLeaves);
    return (
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave History</h3>
        <p className="text-red-500">Error: Unable to load leave data.</p>
      </div>
    );
  }

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
              employeeLeaves.map((leave, index) => (
                <div
                  key={leave?.id || `leave-${index}`}
                  className="grid grid-cols-4 w-[490px] justify-items-center items-center gap-3 border-b border-[#F0F0F0] pb-2"
                >
                  <span className="body-2">{leave?.leave_type || "Unknown"}</span>
                  <span className="body-2">
                    {formatDateRange(leave?.start_date, leave?.end_date)}
                  </span>
                  <span
                    className={`body-2 rounded-2xl text-white py-1 px-2 ${
                      leave?.status === "Approved"
                        ? "bg-[#03BC66]"
                        : leave?.status === "Pending"
                        ? "bg-[#F3C252]"
                        : "bg-[#E57373]"
                    }`}
                  >
                    {leave?.status || "Unknown"}
                  </span>
                  <span className="body-2">
                    {leave?.remarks || "—"}
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