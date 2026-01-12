import { formatDate } from "../functions/dateFunctions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeaveDisplayLabel, updateLeaveData } from "../functions/getLeaveData";
import { updateEmployeeLeaveBalance } from "../functions/updateEmployeeLeaveBalance";
import { useState, useRef } from "react";
import { useNotification } from "../context/NotificationContext";
import Portal from "./Portal";
import supabase from "../functions/supabase";

function ReviewLeavesModal({ setOpenReviewModal, leave, setShowSpinner }) {
  const [remark, setRemark] = useState(leave.remarks || "");
  const { setPopup } = useNotification();
  const queryClient = useQueryClient();

  const isProcessingRef = useRef(false);

  // ✅ Open attachment using a signed URL (supports old + new formats)
  const openAttachment = async (file) => {
    try {
      const path = file?.path ?? file?.url?.path;
      if (!path) {
        console.warn("⚠️ Missing attachment path:", file);
        return;
      }

      const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(path, 60 * 5);

      if (error) throw error;

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("❌ Failed to open attachment:", err);
      setPopup({
        message: "Failed to open attachment.",
        type: "error",
        onClose: () => setPopup(null),
      });
    }
  };

  const balanceMutation = useMutation({
    mutationFn: async ({ employeeId, leaveType, startDate, endDate, dayFraction }) =>
      await updateEmployeeLeaveBalance(employeeId, leaveType, startDate, endDate, dayFraction),
    onSuccess: () => queryClient.invalidateQueries(["employees"]),
    onError: (err) => {
      console.error("❌ Failed to update employee leave balance:", err);
      setShowSpinner(false);
      isProcessingRef.current = false;
      setPopup({
        message: "Failed to update employee leave balance.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  const leaveStatusMutation = useMutation({
    mutationFn: updateLeaveData,
    onSuccess: async (_, variables) => {
      const { status } = variables;

      if (status === "Approved") {
        await balanceMutation.mutateAsync({
          employeeId: leave.employee_id,
          leaveType: leave.leave_type,
          startDate: leave.start_date,
          endDate: leave.end_date,
          dayFraction: Number(leave.day_fraction) || 1, // ⭐ NEW
        });
      }

      queryClient.invalidateQueries(["leaves"]);
      setShowSpinner(false);
      isProcessingRef.current = false;

      setPopup({
        message: `Leave ${status.toLowerCase()} successfully!`,
        type: "success",
        onClose: () => setPopup(null),
      });
    },
    onError: (error) => {
      console.error("Failed to update leave status:", error);
      setShowSpinner(false);
      isProcessingRef.current = false;
      setPopup({
        message: "Failed to update leave status.",
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  const handleStatusChange = (status) => {
    setOpenReviewModal(false);

    setPopup({
      message:
        status === "Approved"
          ? "Are you sure you want to approve this leave request?"
          : "Are you sure you want to reject this leave request?",
      type: "confirm",
      onConfirm: () => {
        setShowSpinner(true);
        isProcessingRef.current = true;
        leaveStatusMutation.mutate({
          id: leave.id,
          status,
          remarks: remark,
        });
        setPopup(null);
      },
      onCancel: () => {
        if (!isProcessingRef.current) setOpenReviewModal(true);
        setPopup(null);
      },
      onClose: () => {
        if (!isProcessingRef.current) setOpenReviewModal(true);
        setPopup(null);
      },
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] z-[1000] flex justify-center items-center">
        <div className="bg-white p-4 rounded-xl w-[95%] max-w-md shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="subheading-custom-2">Review Leave Application</h2>
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
              onClick={() => setOpenReviewModal(false)}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          <div className="grid grid-cols-2 body-2 text-[#4A4A4A] gap-4">
            <p>Employee:</p>
            <p>{leave.employees.full_name}</p>

            <p>Leave Type:</p>
            <p>{getLeaveDisplayLabel(leave)}</p>

            <p>Date:</p>
            <p>
              {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
            </p>

            <p>Attachments:</p>
            <div className="flex flex-col gap-2">
              {leave.attachments?.length ? (
                leave.attachments.map((file, idx) => {
                  const key = file?.path ?? file?.url?.path ?? `${leave.id}-${idx}`;
                  const label = file?.name ?? file?.url?.name ?? "Attachment";

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => openAttachment(file)}
                      className="text-blue-600 underline text-left"
                    >
                      {label}
                    </button>
                  );
                })
              ) : (
                <span>None</span>
              )}
            </div>

            <p>Remark: (optional)</p>
            <textarea
              rows="3"
              cols="10"
              className="border-2 border-gray-400 rounded-lg p-1"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex gap-3 items-center mt-10 col-span-2 justify-center">
              <button
                className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer hover:bg-[#02a95b]"
                onClick={() => handleStatusChange("Approved")}
              >
                Approve
              </button>
              <button
                className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer hover:bg-[#e03a1d]"
                onClick={() => handleStatusChange("Rejected")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default ReviewLeavesModal;
