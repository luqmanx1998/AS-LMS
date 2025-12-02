import { useState, useRef, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileInput from "../ui/FileInput";
import Pagination from "../ui/Pagination";
import { uploadAttachment } from "../functions/uploadAttachments";
import { upsertLeaveData, getLeaveData } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import { cancelLeave } from "../functions/getLeaveData";


// ✅ Custom Dropdown Component
function CustomSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected value display */}
      <div
        className="border-[#DFE4EA] border-[1px] p-2 w-full lg:w-[238px] rounded-lg bg-white cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full lg:w-[238px] mt-1 bg-white border-[#DFE4EA] border-[1px] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`p-3 cursor-pointer hover:bg-[#EDCEAF] transition-colors ${
                value === option.value ? "bg-[#EDCEAF] font-semibold" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const { setPopup } = useNotification();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [leaveType, setLeaveType] = useState(""); // Custom dropdown state
  const [showSpinner, setShowSpinner] = useState(false);

  // 🧭 New pagination for history
  const [page, setPage] = useState(1);
  const limit = 8; // 8 rows per page for compact layout

  // Leave options for custom dropdown
  const leaveOptions = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Medical", label: "Medical Leave" },
  { value: "Compassionate", label: "Compassionate Leave" },
  { value: "Hospitalisation", label: "Hospitalisation Leave" },
  { value: "Unpaid", label: "Unpaid Leave" },
];


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

  // ✅ Get all leaves
  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    isError: leavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaveData(),
    staleTime: 5 * 60 * 1000,
  });

  const leaves = Array.isArray(leavesResponse)
    ? leavesResponse
    : leavesResponse?.leaves || [];

  const adminLeaves = employee
    ? leaves.filter((leave) => leave.employee_id === employee.id)
    : [];

  const disabledDates = leaves
    .filter(
    (leave) =>
      !["Unpaid", "Medical"].includes(leave.leave_type) &&
      leave.status !== "Rejected"
  )
    .flatMap((leave) => {
      const start = new Date(`${leave.start_date}T00:00:00`);
      const end = new Date(`${leave.end_date}T00:00:00`);
      return getDatesBetween(start, end);
    });

  const leaveMutation = useMutation({
    mutationFn: (payload) => upsertLeaveData(payload),
    onMutate: () => {
      setShowSpinner(true);
    },
    onSuccess: () => {
      setShowSpinner(false);
      setPopup({
        message: "Leave application submitted successfully!",
        type: "success",
        onClose: () => setPopup(null),
      });
      queryClient.invalidateQueries(["leaves"]);
      queryClient.invalidateQueries(["currentEmployee"]);
      methods.reset();
      setStartDate(null);
      setEndDate(null);
      setSelectedFiles([]);
      setLeaveType(""); // Reset custom dropdown
    },
    onError: (err) => {
      setShowSpinner(false);
      console.error("Error submitting leave:", err);
      setPopup({
        message: "Failed to submit leave application.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });


// === CANCEL LEAVE MUTATION ===
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


  // === CANCEL HANDLER ===
  const handleCancel = (leaveId) => {
  setPopup({
    message: "Are you sure you want to cancel this leave?",
    type: "confirm",
    onConfirm: () => {
      cancelMutation.mutate(leaveId);
      setPopup(null);
    },
    onClose: () => setPopup(null),
  });
};



  // Sync custom dropdown with react-hook-form
  useEffect(() => {
    methods.setValue("leaveType", leaveType);
  }, [leaveType, methods]);

  const onSubmit = async (data) => {
    if (!employee?.id) {
      setPopup({
        message: "Error: No logged-in employee found.",
        type: "error",
        onClose: () => setPopup(null),
      });
      return;
    }

    let uploadedUrls = [];
    if (data.documents?.length > 0) {
      try {
        setShowSpinner(true);
        for (const file of data.documents) {
          const url = await uploadAttachment(employee.id, file);
          uploadedUrls.push({ name: file.name, url });
        }
      } catch (error) {
        setShowSpinner(false);
        setPopup({
          message: "Failed to upload documents. Please try again.",
          type: "error",
          onClose: () => setPopup(null),
        });
        return;
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

    if (!["Unpaid", "Medical", "Compassionate", "Hospitalisation"].includes(leaveType) && start && end) {
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

  // Show loading spinner while data is loading
  if (isEmployeeLoading || leavesLoading) {
    return (
      <div className="lg:p-4">
        <LoadingSpinner message="Loading your leave data..." />
      </div>
    );
  }

  if (isEmployeeError || leavesError) {
    return (
      <div className="lg:p-4">
        <p className="text-center text-red-500 py-8">Error loading data. Please try refreshing the page.</p>
      </div>
    );
  }

  const sortedAdminLeaves = [...adminLeaves].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // ✅ Paginate sortedAdminLeaves
  const totalPages = Math.ceil(sortedAdminLeaves.length / limit);
  const paginatedLeaves = sortedAdminLeaves.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <>
      {/* Global Loading Spinner */}
      {showSpinner && <LoadingSpinner message="Processing your request..." />}
      
      <div className="lg:p-4">
        <h1 className="heading-custom-1 hidden lg:block pb-4 lg:w-[calc(100%-280px)] lg:translate-x-70">My Leave</h1>
        
        {/* === Admin Leave Application Form === */}
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4 mb-8 lg:w-[calc(100%-280px)] lg:translate-x-70"
          >
            <h2 className="subheading-custom-2 mb-4">
              {employee?.full_name || "Admin"}
            </h2>

            <h3 className="body-1 font-semibold mb-2">Leave Application</h3>

            {/* Leave Type - Custom Dropdown */}
            <div className="lg:flex lg:flex-col">
              <p className="body-2 text-[#4A4A4A] mb-2">Leave Type *</p>
              <CustomSelect
                value={leaveType}
                onChange={setLeaveType}
                options={leaveOptions}
                placeholder="Select leave type..."
              />
              {/* Hidden input for react-hook-form validation */}
              <input
                type="hidden"
                {...methods.register("leaveType", { required: true })}
              />
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
                ["Unpaid", "Medical", "Compassionate", "Hospitalisation"].includes(leaveType)
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

                <div className="w-[90%] space-y-3 lg:flex lg:flex-col lg:items-center lg:justify-center">
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
                      className="bg-[#EDCEAF] text-sm px-3 py-1 rounded-lg lg:self-center lg:mr-2 cursor-pointer hover:bg-[#e0b98d] transition-all"
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
              disabled={leaveMutation.isPending || isUnavailable || showSpinner}
              className={`pink-button body-2 w-[114px] self-start ${
                isUnavailable || showSpinner ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {leaveMutation.isPending || showSpinner ? "Submitting..." : "Submit"}
            </button>
          </form>
        </FormProvider>

        {/* === Admin Leave History === */}
        {/* === Admin Leave History === */}
<div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 lg:w-[calc(100%-280px)] lg:translate-x-70 lg:flex lg:flex-col lg:items-center lg:overflow-hidden">
  <h3 className="subheading-custom-2 mb-4">Your Leave History</h3>

  <div className="border-[#DFE4EA] border-[1px] rounded-lg">
    {/* Header */}
    <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
      <div className="grid grid-cols-5 w-[550px] lg:w-200 justify-items-center items-center">
        <span className="body-2 font-medium">Leave Type</span>
        <span className="body-2 font-medium">Dates</span>
        <span className="body-2 font-medium">Status</span>
        <span className="body-2 font-medium">Remarks</span>
        <span className="body-2 font-medium">Actions</span>
      </div>
    </div>

    {/* Rows */}
    <div className="px-4 py-2 overflow-scroll space-y-2">
      {paginatedLeaves.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-2">
          No leave applications yet.
        </p>
      ) : (
        paginatedLeaves.map((leave, index) => (
          <div
            key={leave.id || `leave-${index}`}
            className="grid grid-cols-5 w-[550px] lg:w-200 justify-items-center items-center gap-3 border-b border-[#F0F0F0] pb-2"
          >
            {/* Leave Type */}
            <span className="body-2">{leave.leave_type}</span>

            {/* Dates */}
            <span className="body-2 text-center">
              {formatDateRange(leave.start_date, leave.end_date)}
            </span>

            {/* Status */}
            <span
              className={`body-2 rounded-2xl text-white py-1 px-2 ${
                leave.status === "Approved"
                  ? "bg-[#03BC66]"
                  : leave.status === "Pending"
                  ? "bg-[#F3C252]"
                  : leave.status === "Cancelled"
                  ? "bg-gray-400"
                  : "bg-[#E57373]"
              }`}
            >
              {leave.status}
            </span>

            {/* Remarks */}
            <span className="body-2 text-center">
              {leave.remarks || "—"}
            </span>

            {/* Cancel Action */}
            <button
              onClick={() => handleCancel(leave.id)}
              className="px-2 py-1 rounded-2xl cursor-pointer bg-red-500 text-xs hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={leave.status !== "Pending"}
            >
              Cancel
            </button>
          </div>
        ))
      )}
    </div>
  </div>

  {/* Pagination */}
  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
</div>

      </div>
    </>
  );
}

export default AdminLeave;