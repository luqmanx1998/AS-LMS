import React, { useState } from "react";
import ReviewLeavesModal from "../ui/ReviewLeavesModal";
import { getLeaveData } from "../functions/getLeaveData";
import { formatDate, formatDateRange } from "../functions/dateFunctions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadAttachments } from "../functions/downloadAttachment";
import { clearAllLeaves, clearLeavesOlderThan } from "../functions/clearLeaves";

function LeaveApplications() {

  const queryClient = useQueryClient();

  const [clearing, setClearing] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaves", page],
    queryFn: () => getLeaveData(page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const clearMutation = useMutation({
    mutationFn: async (type) => {
      setClearing(true);
      if (type === "all") return await clearAllLeaves();
      if (type === "7days") return await clearLeavesOlderThan(7);
    },
    onSuccess: () => {
      alert("Leaves cleared successfully!");
      queryClient.invalidateQueries(["leaves"]);
      setClearing(false);
    },
    onError: (err) => {
      alert(err.message || "Failed to clear leaves.");
      setClearing(false);
    },
  });

  const leaves = data?.leaves || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) return <p>Loading leave applications...</p>;
  if (isError) return <p>Error loading leaves: {error.message}</p>;

  const handleReviewClick = (leave) => {
    setSelectedLeave(leave);
    setOpenReviewModal(true);
  };

  const capitalizeWords = (str) =>
    str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

  return (
    <div>
      {openReviewModal && selectedLeave && (
        <ReviewLeavesModal
          setOpenReviewModal={setOpenReviewModal}
          leave={selectedLeave}
        />
      )}

      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <div className="flex justify-between items-center mb-2">
        <h3 className="subheading-custom-2 mb-4">Leave Applications</h3>

         <div className="mb-4 flex gap-2 justify-end">
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to clear leaves? This action cannot be undone.")
              ) {
                clearMutation.mutate("7days");
              }
            }}
            disabled={clearing}
            className="border border-[#DFE4EA] rounded-lg px-3 py-1 body-2 text-[#4A4A4A] hover:bg-[#F6F6F6] cursor-pointer"
          >
            Clear Last 7 Days
          </button>

          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to clear ALL leaves? This action cannot be undone.")
              ) {
                clearMutation.mutate("all");
              }
            }}
            disabled={clearing}
            className="bg-[#E57373] text-white rounded-lg px-3 py-1 body-2 hover:bg-[#d95f5f] cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

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
                <span className="body-2">
                  {capitalizeWords(leave.employees?.department)}
                </span>
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
                  className={`body-2 rounded-2xl text-white py-1 px-2 w-20 text-center ${
                    leave.status.replace(/"/g, "") === "Approved"
                      ? "bg-[#03BC66]"
                      : leave.status.replace(/"/g, "") === "Rejected"
                      ? "bg-[#E57373]"
                      : "bg-[#F3C252]"
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

        {/* 🔢 Pagination Controls */}
        <div className="flex justify-center items-center gap-3 mt-4">
         {totalPages > 1 && <button
            className="px-3 py-1 rounded-lg border border-[#DFE4EA] body-2"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>}
          <span className="body-2">
            Page {page} of {totalPages || 1}
          </span>
         {totalPages > 1 && <button
            className="px-3 py-1 rounded-lg border border-[#DFE4EA] body-2"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
          >
            Next →
          </button>}
        </div>
      </div>
    </div>
  );
}

export default LeaveApplications;
