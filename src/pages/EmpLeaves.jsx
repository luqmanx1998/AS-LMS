import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FileInput from "../ui/FileInput";
import { uploadAttachment } from "../functions/uploadAttachments";
import { upsertLeaveData } from "../functions/getLeaveData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaveData } from "../functions/getLeaveData";
import { getEmployees } from "../functions/getEmployees";
import supabase from "../functions/supabase";

function getDatesBetween(start, end) {
  const dateArray = [];
  
  // Force to local day-only values
  let currentDate = new Date(start);
  const stopDate = new Date(end);
  currentDate.setHours(0, 0, 0, 0);
  stopDate.setHours(0, 0, 0, 0);

  while (currentDate <= stopDate) {
    // Push a clone so we don’t mutate reference
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0); // normalize every loop
  }

  return dateArray;
}



function EmpLeaves() {

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const methods = useForm();
  const queryClient = useQueryClient();

   useEffect(() => {
    async function fetchEmployeeId() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: employee, error } = await supabase
        .from("employees")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching employee ID:", error.message);
        return;
      }

      setEmployeeId(employee?.id || null);
    }

    fetchEmployeeId();
  }, []);

  const { data: leaves = [], isLoading } = useQuery({
  queryKey: ["leaves"],
  queryFn: getLeaveData,
  staleTime: 5 * 60 * 1000,
  });

  const disabledDates = leaves
  .filter((leave) => leave.leave_type !== "Unpaid" &&
      leave.leave_type !== "Medical" &&
      leave.status !== "Rejected")
  .flatMap((leave) => {
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);

    // Normalize both sides
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return getDatesBetween(start, end);
  });



  const leaveMutation = useMutation({
    mutationFn: (payload) => upsertLeaveData(payload),
    onSuccess: (data) => {
      console.log("Leave submitted successfully:", data);
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

  const onSubmit = async (data) => {
    if (!employeeId) {
      alert("Error: No logged-in employee found.");
      return;
    }

    let uploadedUrls = [];

    // handle multiple attachments
    if (data.documents && data.documents.length > 0) {
      for (const file of data.documents) {
        const url = await uploadAttachment(employeeId, file);
        uploadedUrls.push({
          name: file.name,
          url,
        });
      }
    }

    const payload = {
      employee_id: employeeId,
      leave_type: data.leaveType,
      start_date: data.startDate,
      end_date: data.endDate,
      attachments: uploadedUrls.length > 0 ? uploadedUrls : null,
      status: "Pending",
      remarks: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Final payload:", payload);
    leaveMutation.mutate(payload);
  };

  const leaveType = methods.watch("leaveType");

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
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(0, 0, 0, 0);
            setStartDate(start);
            setEndDate(end);
            methods.setValue("startDate", start);
            methods.setValue("endDate", end);

            // Check overlap only if not Unpaid or Medical
            if (
              leaveType !== "Unpaid" &&
              leaveType !== "Medical" &&
              start &&
              end
            ) {
              const selectedRange = getDatesBetween(start, end);
              const hasOverlap = selectedRange.some((d) =>
                disabledDates.some(
                  (blocked) => d.toDateString() === blocked.toDateString()
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


        {/* Document Upload */}
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
            <div className="w-[90%]">
              <FileInput name="documents" label="Uploaded files" multiple />
            </div>
          </div>
        </div>

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
  );
}

export default EmpLeaves;
