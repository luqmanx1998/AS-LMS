import React, { useState, useMemo, useEffect } from "react";
import ReviewLeavesModal from "../ui/ReviewLeavesModal";
import { getLeaveData } from "../functions/getLeaveData";
import { formatDate, formatDateRange } from "../functions/dateFunctions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadAttachments } from "../functions/downloadAttachment";
import { clearAllLeaves, clearLeavesOlderThan, clearLeavesBetween } from "../functions/clearLeaves";
import Pagination from "../ui/Pagination";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../ui/LoadingSpinner";

function LeaveApplications() {
  const queryClient = useQueryClient();
  const { setPopup } = useNotification();

  const [clearing, setClearing] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [uiLeaves, setUiLeaves] = useState([]);

  // NEW STATE for date range deletion
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const limit = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["leaves", page],
    queryFn: () => getLeaveData(page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const clearMutation = useMutation({
    mutationFn: async (type) => {
      setClearing(true);
      if (type === "all") return await clearAllLeaves();
    },
    onSuccess: (_, type) => {
      setPopup({
        message:
          type === "all"
            ? "All leaves have been cleared successfully."
            : "Leaves cleared successfully.",
        type: "success",
        onClose: () => setPopup(null),
      });
      queryClient.invalidateQueries(["leaves"]);
      setClearing(false);
    },
    onError: (err) => {
      setPopup({
        message: err.message || "Failed to clear leaves.",
        type: "error",
        onClose: () => setPopup(null),
      });
      setClearing(false);
    },
  });

  const leaves = data?.leaves || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    setUiLeaves(leaves);
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return uiLeaves.filter((leave) => {
      const matchesStatus =
        statusFilter === "All" ||
        leave.status?.replace(/"/g, "") === statusFilter;
      const matchesSearch =
        leave.employees?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) || false;
      return matchesStatus && matchesSearch;
    });
  }, [uiLeaves, statusFilter, searchTerm]);

  if (isLoading) return <LoadingSpinner message="Loading..." />;
  if (isError) return <p>Error loading leaves: {error.message}</p>;

  const handleReviewClick = (leave) => {
    setSelectedLeave(leave);
    setOpenReviewModal(true);
  };

  // ⭐ UPDATED CLEAR HANDLER
  const handleConfirmClear = (type) => {
    setPopup({
      message:
        type === "all"
          ? "Are you sure you want to clear ALL leaves? This action cannot be undone."
          : type === "range"
          ? `Delete leaves from ${rangeStart} to ${rangeEnd}?`
          : "Are you sure you want to clear leaves older than 7 days?",
      type: "confirm",
      onConfirm: async () => {
        // ✔ Range delete
        if (type === "range") {
          if (!rangeStart || !rangeEnd) {
            setPopup({
              message: "Please select both start and end dates.",
              type: "error",
              onClose: () => setPopup(null),
            });
            return;
          }

          try {
            setShowSpinner(true);
            await clearLeavesBetween(
              rangeStart + "T00:00:00",
              rangeEnd + "T23:59:59"
            );

            setPopup({
              message: `Leaves from ${rangeStart} to ${rangeEnd} deleted.`,
              type: "success",
              onClose: () => setPopup(null),
            });
            queryClient.invalidateQueries(["leaves"]);
          } catch (err) {
            setPopup({
              message: err.message || "Failed to delete selected range.",
              type: "error",
              onClose: () => setPopup(null),
            });
          } finally {
            setShowSpinner(false);
          }

          return;
        }

        // ✔ Delete older than 7 days (UI only)
        if (type === "7days") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          setUiLeaves((prev) =>
            prev.filter((leave) => new Date(leave.created_at) >= sevenDaysAgo)
          );

          setPopup({
            message: "Leaves older than 7 days have been hidden.",
            type: "success",
            onClose: () => setPopup(null),
          });

          return;
        }

        // ✔ Delete ALL (backend)
        if (type === "all") {
          clearMutation.mutate("all");
        }

        setPopup(null);
      },
      onCancel: () => setPopup(null),
      onClose: () => setPopup(null),
    });
  };

  const capitalizeWords = (str) =>
    str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";

  return (
    <div className="lg:w-[calc(100%-280px)] lg:translate-x-[280px] lg:px-4 lg:py-4 lg:space-y-6">

      {showSpinner && <LoadingSpinner message="Updating leave status..." />}

      {openReviewModal && selectedLeave && (
        <ReviewLeavesModal
          setOpenReviewModal={setOpenReviewModal}
          leave={selectedLeave}
          setShowSpinner={setShowSpinner}
        />
      )}

      <h1 className="hidden lg:block heading-custom-1">Leave Application</h1>

      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
          <h3 className="subheading-custom-2 mb-2">Leave Applications</h3>

          <div className="flex gap-2 items-center flex-wrap">

            {/* Search */}
            <div className="flex items-center gap-2 mr-8">
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-[200px]"
            />

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            </div>

            {/* ⭐ DELETE RANGE UI */}
            <input
              type="date"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1"
            />

            <span>to</span>

            <input
              type="date"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1"
            />

            <button
              onClick={() => handleConfirmClear("range")}
              className="border border-[#DFE4EA] rounded-lg px-3 py-1 body-2 text-[#4A4A4A]"
            >
              Delete Range
            </button>
          </div>
        </div>

        {/* TABLE */}
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
            {filteredLeaves.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                No matching leaves found.
              </p>
            ) : (
              filteredLeaves.map((leave) => (
                <div
                  className="grid grid-cols-8 min-w-[850px] justify-items-center items-center text-center"
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
                    className={`body-2 ${
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
                    className={`body-2 rounded-2xl text-white py-1 px-1.5 w-20 ${
                      leave.status.replace(/"/g, "") === "Approved"
                        ? "bg-[#03BC66]"
                        : leave.status.replace(/"/g, "") === "Rejected"
                        ? "bg-[#FF4120]"
                        : leave.status.replace(/"/g, "") === "Cancelled"
                        ? "bg-gray-400"
                        : "bg-[#F3C252]"
                    }`}
                  >
                    {leave.status.replace(/"/g, "")}
                  </span>

                  <button
                    className="py-1 px-2.5 bg-[#E7AE40] text-white body-2 rounded-lg"
                    onClick={() => handleReviewClick(leave)}
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default LeaveApplications;
