import { formatDate } from "../functions/dateFunctions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeaveData } from "../functions/getLeaveData";
import { useState } from "react";

function ReviewLeavesModal({ setOpenReviewModal, leave }) {
  const [remark, setRemark] = useState(leave.remarks || "");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateLeaveData,
    onSuccess: () => {
      queryClient.invalidateQueries(["leaves"]);
      alert("Leave status updated successfully!");
      setOpenReviewModal(false);
    },
    onError: (error) => {
      console.error("Failed to update leave status:", error);
      alert("Failed to update leave status.");
    },
  });

  const handleStatusChange = (status) => {
    mutation.mutate({ id: leave.id, status, remarks: remark });
  };

  return (
    <div className="top-0 left-0 fixed bg-[rgba(0,0,0,0.2)] z-100 w-full h-full flex justify-center">
      <div className="bg-white p-4 fixed top-50 rounded-xl w-[95%] space-y-5">
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
          <p>{leave.leave_type}</p>

          <p>Date:</p>
          <p>{`${formatDate(leave.start_date)} - ${formatDate(
            leave.end_date
          )}`}</p>

          <p>Attachments:</p>
          <div className="flex flex-col gap-2">
            {leave.attachments?.length ? (
              leave.attachments.map((file) => (
                <a
                  key={file.url}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {file.name}
                </a>
              ))
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
              className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer"
              onClick={() => handleStatusChange("Approved")}
            >
              Approve
            </button>
            <button
              className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer"
              onClick={() => handleStatusChange("Rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewLeavesModal;
