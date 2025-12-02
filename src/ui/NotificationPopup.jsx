import { useEffect } from "react";
import { createPortal } from "react-dom";

function NotificationPopup({
  message,
  type = "info",
  onConfirm,
  onCancel,
  autoClose = true,
  duration = 3000,
  onClose,
}) {
  useEffect(() => {
    if (autoClose && type !== "confirm") {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, type]);

  const colors = {
    success: "bg-[#03BC66] text-white",
    error: "bg-[#FF4120] text-white",
    warning: "bg-[#F3C252] text-black",
    info: "bg-[#E7AE40] text-black",
    confirm: "bg-white border border-gray-200 text-black",
  };

  const content = (
    <div className="fixed inset-0 flex justify-center items-start z-[9999] pointer-events-none">
      <div
        className={`mt-10 rounded-xl shadow-xl px-6 py-4 w-[90%] max-w-sm text-center pointer-events-auto transition-all duration-300 ${
          colors[type] || colors.info
        }`}
      >
        <p className="body-2 mb-3">{message}</p>

        {type === "confirm" && (
          <div className="flex justify-center gap-3 mt-2">
            <button
              onClick={() => {
                onConfirm?.();
                onClose?.();
              }}
              className="px-4 py-1.5 bg-[#03BC66] text-white rounded-lg hover:bg-[#02a95b] cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={() => {
                onCancel?.();
                onClose?.();
              }}
              className="px-4 py-1.5 bg-[#FF4120] text-white rounded-lg hover:bg-[#e03a1d] cursor-pointer"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default NotificationPopup;
