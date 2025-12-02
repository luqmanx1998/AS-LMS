import { useState } from "react";
import supabase from "../functions/supabase";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "../ui/LoadingSpinner";

function EmpResetPasswordModal({ onClose, setShowSpinner }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setPopup } = useNotification();

  async function handleReset() {
    if (newPassword !== confirmPassword) {
      setPopup({
        message: "Passwords do not match!",
        type: "error",
        onClose: () => setPopup(null),
      });
      return;
    }

    try {
      setLoading(true);
      setShowSpinner(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      // Close modal first, then show success message
      onClose();
      setTimeout(() => {
        setPopup({
          message: "Password updated successfully!",
          type: "success",
          onClose: () => setPopup(null),
        });
      }, 100);
    } catch (err) {
      console.error("Reset error:", err.message);
      setPopup({
        message: err.message,
        type: "error",
        onClose: () => setPopup(null),
      });
    } finally {
      setLoading(false);
      setShowSpinner(false);
    }
  }

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
          Enter a new password for your account.
        </p>

        {/* Password Fields */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New password"
              className="border border-[#DFE4EA] rounded-md p-2 w-full pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-[#7F8184] select-none"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off">
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                  <path d="m2 2 20 20"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="border border-[#DFE4EA] rounded-md p-2 w-full pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <span
              className="absolute right-3 top-2.5 cursor-pointer text-[#7F8184] select-none"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off-icon lucide-eye-off">
                  <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
                  <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                  <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                  <path d="m2 2 20 20"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Updating..." : "Confirm"}
          </button>
          <button
            className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmpResetPasswordModal;