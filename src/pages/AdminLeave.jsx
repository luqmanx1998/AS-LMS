import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileInput from "../ui/FileInput";
import { uploadAttachment } from "../functions/uploadAttachments";
import { upsertLeaveData, getLeaveData } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";

// ✅ Helper functions
function getDatesBetween(start, end) {
  if (!start || !end) return [];
  const dates = [];
  const current = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
  const stop = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
  while (current <= stop) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function formatDateRange(start, end) {
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
}

function AdminLeave() {
  const methods = useForm();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ✅ Get current admin
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

  // ✅ Get all leaves - handle both array and object formats
  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    isError: leavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaveData(),
    staleTime: 5 * 60 * 1000,
  });

  // ✅ Handle both array and object response formats
  const leaves = Array.isArray(leavesResponse) 
    ? leavesResponse 
    : (leavesResponse?.leaves || []);

  // ✅ Filter for admin's own leaves only
  const adminLeaves = employee
    ? leaves.filter((leave) => leave.employee_id === employee.id)
    : [];

  const disabledDates = leaves
    .filter(
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

  const leaveMutation = useMutation({
    mutationFn: (payload) => upsertLeaveData(payload),
    onSuccess: () => {
      alert("Leave application submitted successfully!");
      // ✅ Invalidate both queries to refresh both pages
      queryClient.invalidateQueries(["leaves"]);
      queryClient.invalidateQueries(["currentEmployee"]); // In case balance changed
      methods.reset();
      setStartDate(null);
      setEndDate(null);
      setSelectedFiles([]);
    },
    onError: (err) => {
      console.error("Error submitting leave:", err);
      alert("Failed to submit leave.");
    },
  });

  const leaveType = methods.watch("leaveType");

  const onSubmit = async (data) => {
    if (!employee?.id) {
      alert("Error: No logged-in employee found.");
      return;
    }

    let uploadedUrls = [];
    if (data.documents?.length > 0) {
      for (const file of data.documents) {
        const url = await uploadAttachment(employee.id, file);
        uploadedUrls.push({ name: file.name, url });
      }
    }

    const formatDateForDB = (date) => {
      if (!date) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
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

  const handleDateChange = (dates) => {
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
  };

  if (isEmployeeLoading || leavesLoading) return <p>Loading...</p>;
  if (isEmployeeError || leavesError) return <p>Error loading data.</p>;

  const sortedAdminLeaves = [...adminLeaves].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <>
      {/* === Admin Leave Application Form === */}
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4 mb-8"
        >
          <h2 className="subheading-custom-2 mb-4">
            {employee?.full_name || "Admin"}
          </h2>

          <h3 className="body-1 font-semibold mb-2">Leave Application</h3>

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
          <div>
            <p className="body-2 text-[#4A4A4A] mb-2">Date Range *</p>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              minDate={new Date()}
              excludeDates={
                leaveType === "Unpaid" || leaveType === "Medical"
                  ? []
                  : disabledDates
              }
              placeholderText="Select date range"
              className="border-[#DFE4EA] border-[1px] p-2 rounded-lg w-full"
            />
            {startDate && endDate && (
              <p
                className={`mt-1 text-sm ${
                  isUnavailable ? "text-red-500" : "text-green-600"
                }`}
              >
                {isUnavailable
                  ? "Some of your selected dates are already booked."
                  : "All selected dates are available!"}
              </p>
            )}
          </div>

          {/* Documents */}
          <div>
            <p className="body-2 text-[#4A4A4A] mb-2">Documents (optional)</p>
            <div className="w-full border-dashed border-blue-300 border-[2px] rounded-lg py-6 flex flex-col items-center space-y-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-cloud-upload-icon"
              >
                <path d="M12 13v8" />
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="m8 17 4-4 4 4" />
              </svg>
              <h2 className="body-1">Select File(s)</h2>

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
                {selectedFiles?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles([]);
                      methods.setValue("documents", []);
                      const fileInput = document.getElementById("documents");
                      if (fileInput) fileInput.value = "";
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
            disabled={leaveMutation.isPending || isUnavailable}
            className={`pink-button body-2 w-[114px] self-start ${
              isUnavailable ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {leaveMutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      </FormProvider>

      {/* === Admin Leave History (own records) === */}
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Your Leave History</h3>

        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
          <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
            <div className="grid grid-cols-4 w-[490px] justify-items-center items-center">
              <span className="body-2 font-medium">Leave Type</span>
              <span className="body-2 font-medium">Dates</span>
              <span className="body-2 font-medium">Status</span>
              <span className="body-2 font-medium">Remarks</span>
            </div>
          </div>

          <div className="px-4 py-2 overflow-scroll space-y-2">
            {sortedAdminLeaves.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-2">
                No leave applications yet.
              </p>
            ) : (
              sortedAdminLeaves.map((leave) => (
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
                  <span className="body-2">{leave.remarks || "—"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLeave;