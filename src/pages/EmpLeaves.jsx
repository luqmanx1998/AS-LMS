import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import FileInput from "../ui/FileInput";
import { uploadAttachment } from "../functions/uploadAttachments";
import { upsertLeaveData, getLeaveData } from "../functions/getLeaveData";
import { getCurrentEmployee } from "../functions/getCurrentEmployee";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect, useRef } from "react";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../ui/LoadingSpinner";

// 📌 Custom Dropdown
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

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="border-[#DFE4EA] border p-2 rounded-lg bg-white cursor-pointer flex justify-between items-center w-full lg:w-[238px]"
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
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-lg z-20 mt-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`p-3 cursor-pointer hover:bg-[#EDCEAF] ${
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

// 📌 Safe date-range generator
function getDatesBetween(start, end) {
  if (!start || !end) return [];
  const dates = [];
  const current = new Date(
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  );
  const stop = new Date(
    Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  );
  while (current <= stop) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

export default function EmpLeaves() {
  const methods = useForm();
  const queryClient = useQueryClient();
  const { setPopup } = useNotification();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSpinner, setShowSpinner] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState(null);


  const leaveType = methods.watch("leaveType");

  const leaveOptions = [
  { value: "Annual", label: "Annual Leave" },
  { value: "Annual Half-Day", label: "Annual Leave (Half-Day)" }, // ⭐ ADD
  { value: "Annual Appeal", label: "Annual Leave (Appeal)" },
  { value: "Medical", label: "Medical Leave" },
  { value: "Compassionate", label: "Compassionate Leave" },
  { value: "Hospitalisation", label: "Hospitalisation Leave" },
  { value: "Unpaid", label: "Unpaid Leave" },
];


  // 1️⃣ Fetch employee
  const { data: employee, isLoading: empLoading } = useQuery({
    queryKey: ["currentEmployee"],
    queryFn: getCurrentEmployee,
    staleTime: 600_000,
  });

  // ✅ Remaining Annual Leave (NEW)
  const remainingAnnualLeave =
    employee?.total_leaves?.annualLeave?.remaining ?? 0;

  // 2️⃣ Fetch leaves
  const { data: leavesResponse, isLoading: leavesLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaveData(),
    staleTime: 300_000,
  });

  const leaves = Array.isArray(leavesResponse)
    ? leavesResponse
    : leavesResponse?.leaves || [];

  // 3️⃣ Blocked dates ONLY for Annual (NOT Appeal)
  const disabledDates = leaves
    .filter(
      (leave) =>
        leave.leave_type === "Annual" &&
        leave.status !== "Rejected" &&
        leave.employees?.department === employee?.department
    )
    .flatMap((leave) =>
      getDatesBetween(
        new Date(`${leave.start_date}T00:00:00`),
        new Date(`${leave.end_date}T00:00:00`)
      )
    );

  // 4️⃣ Mutation
  const leaveMutation = useMutation({
    mutationFn: upsertLeaveData,
    onMutate: () => setShowSpinner(true),
    onSuccess: () => {
      setShowSpinner(false);
      setPopup({
        message: "Leave submitted!",
        type: "success",
        onClose: () => setPopup(null),
      });
      queryClient.invalidateQueries(["leaves"]);
      methods.reset();
      setStartDate(null);
      setEndDate(null);
      setSelectedFiles([]);
    },
    onError: () => {
      setShowSpinner(false);
      setPopup({
        message: "Failed to submit leave.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  // 5️⃣ Date change handler
  const handleDateChange = (dates) => {
  // ⭐ NORMALIZE react-datepicker behaviour
  const start = Array.isArray(dates) ? dates[0] : dates;
  const end = Array.isArray(dates) ? dates[1] : dates;

  setStartDate(start);
  setEndDate(end ?? start);

  methods.setValue("startDate", start);
  methods.setValue("endDate", end ?? start);

  if (leaveType === "Annual" && start && end) {
    const range = getDatesBetween(start, end);
    const hasOverlap = range.some((d) =>
      disabledDates.some(
        (blocked) => d.toDateString() === blocked.toDateString()
      )
    );
    setIsUnavailable(hasOverlap);
  } else {
    setIsUnavailable(false);
  }
};


  // 6️⃣ Form submit
  const onSubmit = async (data) => {
    if (!employee) return;

    // 🚫 BLOCK Annual Leave at 0 balance (NEW)
    if (data.leaveType === "Annual" && remainingAnnualLeave <= 0) {
      setPopup({
        message:
          "You have no remaining Annual Leave. Please apply using Annual Leave (Appeal).",
        type: "error",
        onClose: () => setPopup(null),
      });
      return;
    }

    if (data.leaveType === "Annual Half-Day" && remainingAnnualLeave < 0.5) {
      setPopup({
        message:
          "You do not have enough Annual Leave balance for a half-day leave.",
        type: "error",
        onClose: () => setPopup(null),
      });
      return;
    }

    let uploadedUrls = [];

    if (data.documents?.length > 0) {
      setShowSpinner(true);
      for (const file of data.documents) {
        const url = await uploadAttachment(employee.id, file);
        uploadedUrls.push({ name: file.name, url });
      }
    }

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    leaveMutation.mutate({
  employee_id: employee.id,

  // ⭐ Normalize leave type
  leave_type:
    data.leaveType === "Annual Half-Day" ? "Annual" : data.leaveType,

  start_date: formatDate(startDate),
  end_date: formatDate(endDate),

  // ⭐ Half-day support
  day_fraction: data.leaveType === "Annual Half-Day" ? 0.5 : 1,
  half_day_period:
    data.leaveType === "Annual Half-Day" ? halfDayPeriod : null,

  attachments: uploadedUrls.length ? uploadedUrls : null,
  status: "Pending",

  remarks:
    leaveType === "Annual Appeal" ? data.appealRemarks : null,

  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
  };

  if (empLoading || leavesLoading)
    return <LoadingSpinner message="Loading leave form..." />;

  return (
    <>
      {showSpinner && <LoadingSpinner message="Submitting leave..." />}

      <div className="lg:p-4">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="rounded-2xl border p-4 border-[#DFE4EA] space-y-4 lg:w-[calc(100%-280px)] lg:translate-x-70"
          >
            <h1 className="hidden lg:block heading-custom-1">My Leave</h1>
            <h3 className="body-1 font-semibold">Apply for Leave</h3>

            {/* Leave Type */}
            <div>
              <p className="body-2 mb-2">Leave Type *</p>
              <CustomSelect
                value={leaveType}
                onChange={(v) => methods.setValue("leaveType", v)}
                options={leaveOptions}
                placeholder="Select leave type..."
              />
              <input
                type="hidden"
                {...methods.register("leaveType", { required: true })}
              />
            </div>

            {/* ⭐ Half-Day selector (ADDITION ONLY) */}
            {leaveType === "Annual Half-Day" && (
              <div className="mt-3">
                <p className="body-2 mb-1">Half-day period *</p>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={halfDayPeriod === "AM"}
                      onChange={() => setHalfDayPeriod("AM")}
                    />
                    First Half (AM)
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={halfDayPeriod === "PM"}
                      onChange={() => setHalfDayPeriod("PM")}
                    />
                    Second Half (PM)
                  </label>
                </div>
              </div>
            )}


            {/* Appeal Reason */}
            {leaveType === "Annual Appeal" && (
              <div className="mt-3">
                <p className="body-2 mb-1">Reason for Appeal *</p>
                <textarea
                  {...methods.register("appealRemarks", { required: true })}
                  placeholder="Explain why you need an appeal for this annual leave request..."
                  className="border border-[#DFE4EA] p-2 rounded-lg w-full h-24"
                ></textarea>
              </div>
            )}

            {/* Date Range */}
            <div>
              <p className="body-2 mb-2">Date Range *</p>
              <DatePicker
                selectsRange={leaveType !== "Annual Half-Day"}
                selected={leaveType === "Annual Half-Day" ? startDate : null} // ⭐ FIX
                startDate={startDate}
                endDate={leaveType === "Annual Half-Day" ? startDate : endDate}
                onChange={handleDateChange}
                minDate={new Date()}
                excludeDates={leaveType === "Annual" ? disabledDates : []}
                className="border border-[#DFE4EA] p-2 rounded-lg w-full"
                placeholderText="Select date"
              />



              {startDate && endDate && (
                <p
                  className={`mt-1 text-sm ${
                    isUnavailable ? "text-red-500" : "text-green-600"
                  }`}
                >
                  {isUnavailable
                    ? "Some selected dates are already booked."
                    : "Selected dates are available!"}
                </p>
              )}

              {leaveType === "Annual" && remainingAnnualLeave <= 0 && (
                <p className="mt-1 text-sm text-red-600">
                  You have no remaining Annual Leave. Please use Annual Leave (Appeal).
                </p>
              )}
            </div>

            {/* Documents */}
            <div>
              <p className="body-2 mb-2">Documents (optional)</p>
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

                <div className="w-[90%]">
                  <FileInput
                    name="documents"
                    multiple
                    value={selectedFiles}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      methods.setValue("documents", files);
                      setSelectedFiles(files);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isUnavailable ||
                showSpinner ||
                (leaveType === "Annual" && remainingAnnualLeave <= 0)
              }
              className={`pink-button w-[114px] ${
                isUnavailable || showSpinner ? "opacity-50" : ""
              }`}
            >
              {showSpinner ? "Submitting..." : "Submit"}
            </button>
          </form>
        </FormProvider>
      </div>
    </>
  );
}
