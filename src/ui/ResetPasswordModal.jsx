import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function ResetPasswordModal({ employee, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🧠 Define API call
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

  // ✅ Correct React Query mutation
  const mutation = useMutation({
    mutationFn: ({ id, newPassword }) => resetPassword(id, newPassword),
    onSuccess: () => {
      alert(`Password reset for ${employee.full_name} successfully`);
      queryClient.invalidateQueries(["employees"]);
      onClose();
    },
    onError: (err) => {
      alert(`Error: ${err.message}`);
    },
  });

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    mutation.mutate({ id: employee.id, newPassword });
  };

  const isLoading = mutation.isPending;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.2)] z-[100] flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-[95%] max-w-md space-y-5">
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

        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="New password"
            className="border border-[#DFE4EA] rounded-md p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="border border-[#DFE4EA] rounded-md p-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

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
