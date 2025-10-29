import React, { useState } from "react";
import ReviewLeavesModal from "../ui/ReviewLeavesModal";
import { getLeaveData } from "../functions/getLeaveData";
import { formatDate, formatDateRange } from "../functions/dateFunctions";
import { useQuery } from "@tanstack/react-query";
import { downloadAttachments } from "../functions/downloadAttachment";

function LeaveApplications() {
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const {
    data: leaves = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: getLeaveData,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <p>Loading leave applications...</p>;
  if (isError) return <p>Error loading leaves: {error.message}</p>;

  const handleReviewClick = (leave) => {
    setSelectedLeave(leave);
    setOpenReviewModal(true);
  };

  return (
    <div>
      {openReviewModal && selectedLeave && (
        <ReviewLeavesModal
          setOpenReviewModal={setOpenReviewModal}
          leave={selectedLeave}
        />
      )}

      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <h3 className="subheading-custom-2 mb-4">Leave Applications</h3>

        <div className="border-[#DFE4EA] border-[1px] rounded-lg">
          <div className="bg-[#EBF1FF] px-4 py-2 overflow-scroll">
            <div className="grid grid-cols-8 min-w-[850px] justify-items-center items-center">
              <span className="body-2">Employee</span>
              <span className="body-2">Department</span>
              <span className="body-2">Leave Type</span>
              <span className="body-2">Submitted</span>
              <span className="body-2">Leave Dates</span>
              <span className="body-2">Attachment</span>
              <span className="body-2">Status</span>
              <span className="body-2">Actions</span>
            </div>
          </div>

          <div className="px-4 py-2 overflow-scroll space-y-2">
            {leaves.map((leave) => (
              <div
                className="grid grid-cols-8 min-w-[850px] justify-items-center items-center"
                key={leave.id}
              >
                <span className="body-2">{leave.employees?.full_name}</span>
                <span className="body-2">{leave.employees?.department}</span>
                <span className="body-2">{leave.leave_type}</span>
                <span className="body-2">{formatDate(leave.created_at)}</span>
                <span className="body-2">
                  {formatDateRange(leave.start_date, leave.end_date)}
                </span>
                <span
                  className={`body-2 text-center ${
                    leave.attachments?.length
                      ? "font-semibold underline cursor-pointer"
                      : ""
                  }`}
                  onClick={() => downloadAttachments(leave.attachments)}
                >
                  {leave.attachments?.length
                    ? `Attachments (${leave.attachments.length})`
                    : "None"}
                </span>
                <span
                  className={`body-2 ${
                    leave.status.replace(/"/g, "") === "Approved"
                      ? "text-green-500"
                      : leave.status.replace(/"/g, "") === "Rejected"
                      ? "text-red-500"
                      : "text-[#FFB628]"
                  }`}
                >
                  {leave.status.replace(/"/g, "")}
                </span>

                <button
                  className="py-1 px-2.5 bg-[#E7AE40] text-white body-2 rounded-lg cursor-pointer"
                  onClick={() => handleReviewClick(leave)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplications;
