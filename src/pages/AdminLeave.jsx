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


// ======================================================
// Custom Select Component
// ======================================================

function CustomSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
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
          className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

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

// ======================================================
// Helper Functions
// ======================================================

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
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString("en-SG", { month: "short", day: "numeric" })} - ${e.toLocaleDateString(
    "en-SG",
    { month: "short", day: "numeric", year: "numeric" }
  )}`;
}

// ======================================================
// MAIN COMPONENT
// ======================================================

function AdminLeave() {
  const methods = useForm();
  const queryClient = useQueryClient();
  const { setPopup } = useNotification();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [leaveType, setLeaveType] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 8;

  // =======================
  // Leave Options
  // =======================
  const leaveOptions = [
    { value: "Annual", label: "Annual Leave" },
    { value: "Annual Appeal", label: "Annual Leave (Appeal)" }, // ⭐ NEW
    { value: "Medical", label: "Medical Leave" },
    { value: "Compassionate", label: "Compassionate Leave" },
    { value: "Hospitalisation", label: "Hospitalisation Leave" },
    { value: "Unpaid", label: "Unpaid Leave" },
  ];

  // =======================
  // Fetch Employee
  // =======================
  const {
    data: employee,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 600000,
    retry: false,
  });

  // =======================
  // Fetch Leaves
  // =======================
  const {
    data: leavesResponse,
    isLoading: leavesLoading,
    isError: leavesError,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaveData(),
    staleTime: 300000,
  });

  const leaves = Array.isArray(leavesResponse)
    ? leavesResponse
    : leavesResponse?.leaves || [];

  const adminLeaves = employee
    ? leaves.filter((leave) => leave.employee_id === employee.id)
    : [];

  // ===========================
  // Disabled Dates Only for Annual (NOT Appeal)
  // ===========================
  const disabledDates = leaves
    .filter(
      (leave) =>
        leave.leave_type === "Annual" &&
        leave.status !== "Rejected" &&
        leave.employees?.department === employee?.department
    )
    .flatMap((leave) => getDatesBetween(new Date(`${leave.start_date}T00:00:00`), new Date(`${leave.end_date}T00:00:00`)));

  // =======================
  // Submit Mutation
  // =======================
  const leaveMutation = useMutation({
    mutationFn: (payload) => upsertLeaveData(payload),
    onMutate: () => setShowSpinner(true),
    onSuccess: () => {
      setShowSpinner(false);
      setPopup({
        message: "Leave application submitted successfully!",
        type: "success",
        onClose: () => setPopup(null),
      });
      methods.reset();
      setStartDate(null);
      setEndDate(null);
      setSelectedFiles([]);
      setLeaveType("");
      queryClient.invalidateQueries(["leaves"]);
    },
    onError: () => {
      setShowSpinner(false);
      setPopup({
        message: "Failed to submit leave application.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  // =======================
  // Cancel Mutation
  // =======================
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

  // =======================
  // Sync Dropdown to Form
  // =======================
  useEffect(() => {
    methods.setValue("leaveType", leaveType);
  }, [leaveType, methods]);

  // =======================
  // Submit Handler
  // =======================
  const onSubmit = async (data) => {
    if (!employee?.id) return;

    let uploadedUrls = [];

    if (data.documents?.length > 0) {
      setShowSpinner(true);
      for (const file of data.documents) {
        const url = await uploadAttachment(employee.id, file);
        uploadedUrls.push({ name: file.name, url });
      }
    }

    const formatDateForDB = (date) => {
      if (!date) return null;
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const payload = {
      employee_id: employee.id,
      leave_type: data.leaveType,
      start_date: formatDateForDB(data.startDate),
      end_date: formatDateForDB(data.endDate),
      attachments: uploadedUrls.length ? uploadedUrls : null,
      status: "Pending",
      remarks: leaveType === "Annual Appeal" ? data.appealRemarks : null, // ⭐ NEW
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    leaveMutation.mutate(payload);
  };

  // =======================
  // Date Change Handler
  // =======================
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    methods.setValue("startDate", start);
    methods.setValue("endDate", end);

    if (leaveType === "Annual" && start && end) {
      const range = getDatesBetween(start, end);
      const hasOverlap = range.some((d) =>
        disabledDates.some((blocked) => d.toDateString() === blocked.toDateString())
      );
      setIsUnavailable(hasOverlap);
    } else {
      setIsUnavailable(false);
    }
  };

  // =======================
  // Loading State
  // =======================
  if (isEmployeeLoading || leavesLoading)
    return (
      <div className="lg:p-4">
        <LoadingSpinner message="Loading your leave data..." />
      </div>
    );

  if (isEmployeeError || leavesError)
    return (
      <div className="lg:p-4">
        <p className="text-center text-red-500 py-8">
          Error loading data. Please refresh.
        </p>
      </div>
    );

  const sortedAdminLeaves = [...adminLeaves].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const totalPages = Math.ceil(sortedAdminLeaves.length / limit);
  const paginatedLeaves = sortedAdminLeaves.slice((page - 1) * limit, page * limit);

  // ======================================================
  // RENDER JSX
  // ======================================================

  return (
    <>
      {showSpinner && <LoadingSpinner message="Processing your request..." />}

      <div className="lg:p-4">

        <h1 className="heading-custom-1 hidden lg:block pb-4 lg:w-[calc(100%-280px)] lg:translate-x-70">
          My Leave
        </h1>

        {/* ===========================
            Leave Application Form
        =========================== */}
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="rounded-2xl border-[#DFE4EA] border-[1px] p-4 space-y-4 mb-8 lg:w-[calc(100%-280px)] lg:translate-x-70"
          >
            <h2 className="subheading-custom-2 mb-4">{employee?.full_name || "Admin"}</h2>
            <h3 className="body-1 font-semibold mb-2">Leave Application</h3>

            {/* Leave Type */}
            <div>
              <p className="body-2 text-[#4A4A4A] mb-2">Leave Type *</p>
              <CustomSelect
                value={leaveType}
                onChange={setLeaveType}
                options={leaveOptions}
                placeholder="Select leave type..."
              />
              <input type="hidden" {...methods.register("leaveType", { required: true })} />
            </div>

            {/* ⭐ Appeal Reason Textarea */}
            {leaveType === "Annual Appeal" && (
              <div className="mt-3">
                <p className="body-2 text-[#4A4A4A] mb-1">Reason for Appeal *</p>
                <textarea
                  {...methods.register("appealRemarks", { required: true })}
                  placeholder="Explain why you need an appeal for this annual leave request..."
                  className="border-[#DFE4EA] border-[1px] p-2 rounded-lg w-full h-24"
                ></textarea>
              </div>
            )}

            {/* Date Picker */}
            <div>
              <p className="body-2 text-[#4A4A4A] mb-2">Date Range *</p>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                minDate={new Date()}
                excludeDates={leaveType === "Annual" ? disabledDates : []}
                placeholderText="Select date range"
                className="border-[#DFE4EA] border-[1px] p-2 rounded-lg w-full"
              />

              {startDate &&
                endDate &&
                (isUnavailable ? (
                  <p className="mt-1 text-sm text-red-500">
                    Some selected dates are already booked.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-green-600">
                    Selected dates are available!
                  </p>
                ))}
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

                  {selectedFiles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);
                        methods.setValue("documents", []);
                        const input = document.getElementById("documents");
                        if (input) input.value = "";
                      }}
                      className="bg-[#EDCEAF] text-sm px-3 py-1 rounded-lg hover:bg-[#e0b98d] transition-all cursor-pointer"
                    >
                      Clear Files
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUnavailable || leaveMutation.isPending || showSpinner}
              className={`pink-button body-2 w-[114px] self-start ${
                isUnavailable || showSpinner ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {showSpinner ? "Submitting..." : "Submit"}
            </button>
          </form>
        </FormProvider>

        {/* ===========================
            Leave History
        =========================== */}
        <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 lg:w-[calc(100%-280px)] lg:translate-x-70 lg:flex lg:flex-col lg:items-center lg:overflow-hidden">
          <h3 className="subheading-custom-2 mb-4">Your Leave History</h3>

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

            <div className="px-4 py-2 overflow-scroll space-y-2">
              {paginatedLeaves.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-2">
                  No leave applications yet.
                </p>
              ) : (
                paginatedLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="grid grid-cols-5 w-[550px] lg:w-200 justify-items-center items-center gap-3 border-b border-[#F0F0F0] pb-2"
                  >
                    <span className="body-2">{leave.leave_type}</span>

                    <span className="body-2 text-center">
                      {formatDateRange(leave.start_date, leave.end_date)}
                    </span>

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

                    <span className="body-2 text-center">
                      {leave.remarks || "—"}
                    </span>

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

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </>
  );
}

export default AdminLeave;
