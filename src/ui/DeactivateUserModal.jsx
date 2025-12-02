import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../context/NotificationContext";

function DeactivateUserModal({ onClose, employee, setShowSpinner }) {
  const { setPopup } = useNotification();

  async function deleteUser(id) {
    const response = await fetch("https://as-lms.vercel.app/api/delete-user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete user");

    return data;
  }

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteUser(employee.id),
    onMutate: () => {
      setShowSpinner(true);
    },
    onSuccess: () => {
      setShowSpinner(false);
      onClose();
      setTimeout(() => {
        setPopup({
          message: `User ${employee.full_name} deactivated successfully!`,
          type: "success",
          onClose: () => setPopup(null),
        });
      }, 100);
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      setShowSpinner(false);
      setPopup({
        message: `Error deactivating user: ${error.message}`,
        type: "error",
        onClose: () => setPopup(null),
      });
    },
  });

  const handleDeactivate = () => {
    onClose();
    setTimeout(() => {
      setPopup({
        message: `Are you sure you want to deactivate ${employee.full_name}? This action cannot be undone.`,
        type: "confirm",
        onConfirm: () => {
          mutation.mutate();
          setPopup(null);
        },
        onCancel: () => setPopup(null),
        onClose: () => setPopup(null),
      });
    }, 100);
  };

  return (
    <div className="top-0 left-0 fixed bg-[rgba(0,0,0,0.2)] z-[100] w-full h-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl w-[95%] max-w-md space-y-5 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="subheading-custom-2">Confirm Deactivation</h2>
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
            onClick={() => onClose()}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        <p className="body-2 text-[#4A4A4A]">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold">{employee.full_name}</span>?
        </p>

        <div className="flex gap-3 items-center justify-center mt-6">
          <button
            className="bg-[#03BC66] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={handleDeactivate}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deactivating..." : "Yes, Deactivate"}
          </button>
          <button
            className="bg-[#FF4120] text-white rounded-md px-4 py-2 cursor-pointer"
            onClick={() => onClose()}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivateUserModal;