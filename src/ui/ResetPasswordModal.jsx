import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNotification } from "../context/NotificationContext";

function ResetPasswordModal({ employee, onClose, setShowSpinner }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setPopup } = useNotification();

  async function resetPassword(id, newPassword) {
    const response = await fetch("https://as-lms.vercel.app/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Reset failed");
    return data;
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, newPassword }) => resetPassword(id, newPassword),
    onMutate: () => {
      setShowSpinner(true);
    },
    onSuccess: () => {
      setShowSpinner(false);
      onClose();
      setTimeout(() => {
        setPopup({
          message: `Password reset for ${employee.full_name} successfully!`,
          type: "success",
          onClose: () => setPopup(null),
        });
      }, 100);
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (err) => {
      setShowSpinner(false);
      setPopup({
        message: `Error: ${err.message}`,
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      setPopup({
        message: "Passwords do not match!",
        type: "error",
        onClose: () => setPopup(null),
      });
      return;
    }
    mutation.mutate({ id: employee.id, newPassword });
  };

  const isLoading = mutation.isPending;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] z-[100] flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-md space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="subheading-custom-2">Reset Password</h2>
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
            onClick={onClose}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <p className="body-2 text-[#4A4A4A]">
          Set a new password for{" "}
          <span className="font-semibold">{employee.full_name}</span>.
        </p>

        {/* Password fields */}
        <div className="flex flex-col gap-3">
          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              className="border border-[#DFE4EA] rounded-md p-2 w-full pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-[#7F8184] select-none"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? (
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
                  className="lucide lucide-eye"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
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
                  className="lucide lucide-eye-off"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              )}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="border border-[#DFE4EA] rounded-md p-2 w-full pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-[#7F8184] select-none"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
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
                  className="lucide lucide-eye"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
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
                  className="lucide lucide-eye-off"
                >
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                  <path d="m2 2 20 20" />
                </svg>
              )}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={handleReset}
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Confirm"}
          </button>
          <button
            className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;