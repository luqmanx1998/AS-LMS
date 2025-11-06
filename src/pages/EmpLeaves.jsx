import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FileInput from "../ui/FileInput";
import { uploadAttachment } from "../functions/uploadAttachments";
import { upsertLeaveData, getLeaveData } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";

// ✅ Safe version of getDatesBetween (timezone-proof, includes end date)
function getDatesBetween(start, end) {
  if (!start || !end) return [];
  const dates = [];
  // Use UTC to avoid timezone issues
  const current = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const stop = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
  
  while (current <= stop) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function EmpLeaves() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [notEnoughBalance, setNotEnoughBalance] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const methods = useForm();
  const queryClient = useQueryClient();

  // ✅ 1. Fetch current employee
  const {
    data: employee,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  // ✅ 2. Fetch all leaves - now returns { leaves, total }
  const { 
  data: leaves = [], 
  isLoading: isLeavesLoading 
} = useQuery({
  queryKey: ["leaves"],
  queryFn: () => getLeaveData(), // Now returns just the array
  staleTime: 5 * 60 * 1000,
});


  // ✅ Disable booked days
  const disabledDates = leaves.filter(
      (leave) =>
        leave.leave_type !== "Unpaid" &&
        leave.leave_type !== "Medical" &&
        leave.status !== "Rejected"
    )
    .flatMap((leave) => {
      const start = new Date(`${leave.start_date}T00:00:00`);
      const end = new Date(`${leave.end_date}T00:00:00`);
      return getDatesBetween(start, end);
    });

  // ✅ 3. Mutation for submitting leave
  const leaveMutation = useMutation({
    mutationFn: upsertLeaveData,
    onSuccess: () => {
      alert("Leave application submitted successfully!");
      queryClient.invalidateQueries(["leaves"]);
      methods.reset();
      setStartDate(null);
      setEndDate(null);
    },
    onError: (err) => {
      console.error("Error submitting leave:", err);
      alert("Failed to submit leave application.");
    },
  });

  const leaveType = methods.watch("leaveType");

  // ✅ 4. Balance check
  useEffect(() => {
    if (!employee || !startDate || !endDate || !leaveType) return;

    const total_leaves = employee.total_leaves || {};
    const keyMap = {
      Annual: "annualLeave",
      Medical: "medicalLeave",
      Unpaid: "unpaidLeave",
    };
    const leaveKey = keyMap[leaveType];
    const leaveBalance = total_leaves[leaveKey]?.remaining ?? 0;
    const selectedDays = getDatesBetween(startDate, endDate).length;

    if (leaveType !== "Unpaid" && selectedDays > leaveBalance) {
      setNotEnoughBalance(true);
    } else {
      setNotEnoughBalance(false);
    }
  }, [employee, startDate, endDate, leaveType]);

  // ✅ 5. Submit handler
  const onSubmit = async (data) => {
  if (!employee) {
    alert("Error: No logged-in employee found.");
    return;
  }

  if (notEnoughBalance) {
    alert(`Not enough ${data.leaveType} leave balance.`);
    return;
  }

  let uploadedUrls = [];
  if (data.documents?.length > 0) {
    for (const file of data.documents) {
      const url = await uploadAttachment(employee.id, file);
      uploadedUrls.push({ name: file.name, url });
    }
  }

  // ✅ FIX: Use local date methods instead of toISOString()
  const formatDateForDB = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const payload = {
    employee_id: employee.id,
    leave_type: data.leaveType,
    start_date: formatDateForDB(data.startDate),
    end_date: formatDateForDB(data.endDate),
    attachments: uploadedUrls.length > 0 ? uploadedUrls : null,
    status: "Pending",
    remarks: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  leaveMutation.mutate(payload);
};

  if (isEmployeeLoading || isLeavesLoading) return <p>Loading leave form...</p>;
  if (isEmployeeError) return <p>Error loading employee data.</p>;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4"
      >
        <h3 className="body-1 font-semibold">Leave Applications</h3>

        {/* Leave Type */}
        <div>
          <p className="body-2 text-[#4A4A4A] mb-2">Leave Type *</p>
          <select
            {...methods.register("leaveType", { required: true })}
            className="border-[#DFE4EA] border-[1px] p-2 w-full rounded-lg"
          >
            <option value="Annual">Annual Leave</option>
            <option value="Medical">Medical Leave</option>
            <option value="Unpaid">Unpaid Leave</option>
          </select>
        </div>

        {/* Date Range */}
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(dates) => {
            const [start, end] = dates;
            setStartDate(start);
            setEndDate(end);
            methods.setValue("startDate", start);
            methods.setValue("endDate", end);

            if (leaveType !== "Unpaid" && leaveType !== "Medical" && start && end) {
              const selectedRange = getDatesBetween(start, end);
              const hasOverlap = selectedRange.some((d) =>
                disabledDates.some(
                  (blocked) => d.toDateString() === new Date(blocked).toDateString()
                )
              );
              setIsUnavailable(hasOverlap);
            } else {
              setIsUnavailable(false);
            }
          }}
          minDate={new Date()}
          excludeDates={
            leaveType === "Unpaid" || leaveType === "Medical" ? [] : disabledDates
          }
          placeholderText="Select date range"
          className="border-[#DFE4EA] border-[1px] p-2 rounded-lg w-full"
        />

        {/* Feedback */}
        {startDate && endDate && (
          <>
            {isUnavailable ? (
              <p className="mt-1 text-sm text-red-500">
                Some of your selected dates are already booked.
              </p>
            ) : notEnoughBalance ? (
              <p className="mt-1 text-sm text-red-500">
                You don't have enough {leaveType} leave balance.
              </p>
            ) : (
              <p className="mt-1 text-sm text-green-600">
                All selected dates are available!
              </p>
            )}
          </>
        )}

        {/* Documents */}
  
<div>
  <p className="body-2 text-[#4A4A4A] mb-2">Documents (optional)</p>

  <div className="w-full border-dashed border-blue-300 border-[2px] rounded-lg py-6 flex flex-col items-center space-y-4">
    {/* ... SVG and heading ... */}

    <div className="w-[90%] space-y-3">
      <FileInput
        name="documents"
        label="Uploaded files"
        multiple
        value={selectedFiles}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          methods.setValue("documents", files);
          setSelectedFiles(files);
        }}
      />

      {/* Clear button */}
      {selectedFiles?.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setSelectedFiles([]);
            methods.setValue("documents", []);
            // ✅ Clear the actual file input
            const fileInput = document.getElementById('documents');
            if (fileInput) fileInput.value = '';
          }}
          className="bg-[#EDCEAF] text-sm px-3 py-1 rounded-lg"
        >
          Clear Files
        </button>
      )}
    </div>
  </div>
</div>

        {/* Submit */}
        <button
          type="submit"
          disabled={leaveMutation.isPending || isUnavailable || notEnoughBalance}
          className={`pink-button body-2 w-[114px] self-start ${
            isUnavailable || notEnoughBalance ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {leaveMutation.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </FormProvider>
  );
}

export default EmpLeaves;