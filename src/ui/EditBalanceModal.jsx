import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeTotalLeaves } from "../functions/updateEmployeeTotalLeaves";
import supabase from "../functions/supabase";
import { useNotification } from "../context/NotificationContext";
import LoadingSpinner from "./LoadingSpinner";

function formatLeaveType(type) {
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

async function fetchEmployeeLeaves(employeeId) {
  const { data, error } = await supabase
    .from("employees")
    .select("total_leaves")
    .eq("id", employeeId)
    .single();

  if (error) throw new Error(error.message);

  // 🔥 Updated fallback to match your newest structure
      return (
      data?.total_leaves || {
        annualLeave: { remaining: 14, used: 0 },
        medicalLeave: { remaining: 14, used: 0 },
        compassionateLeave: { remaining: 5, used: 0 },
        hospitalisationLeave: { remaining: 46, used: 0 }
      }
    );

    }

export default function EditBalanceModal({ employee, onClose, setShowSpinner }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(null);
  const { setPopup } = useNotification();

  const { data: leaveData, isLoading, isError } = useQuery({
    queryKey: ["employeeLeaves", employee.id],
    queryFn: () => fetchEmployeeLeaves(employee.id),
  });

  useEffect(() => {
    if (leaveData && !formData) setFormData(leaveData);
  }, [leaveData, formData]);

  const mutation = useMutation({
    mutationFn: ({ employeeId, newData }) =>
      updateEmployeeTotalLeaves(employeeId, newData),
    onMutate: () => setShowSpinner(true),
    onSuccess: () => {
      setShowSpinner(false);
      onClose();

      setTimeout(() => {
        setPopup({
          message: "Leave balance updated successfully!",
          type: "success",
          onClose: () => {
            queryClient.invalidateQueries(["employees"]);
            queryClient.invalidateQueries(["employeeLeaves", employee.id]);
            setPopup(null);
          },
        });
      }, 100);
    },
    onError: (err) => {
      setShowSpinner(false);
      onClose();
      setTimeout(() => {
        setPopup({
          message: err.message || "Failed to update leave balance.",
          type: "error",
          onClose: () => setPopup(null),
        });
      }, 100);
    },
  });

  const handleChange = (type, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };

      // Ensure each type has both keys
      if (!updated[type]) updated[type] = { remaining: 0, used: 0 };

      updated[type][field] = Number(value);
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData || mutation.isPending) return;

    onClose();

    setTimeout(() => {
      setPopup({
        message: "Are you sure you want to save these changes?",
        type: "confirm",
        onConfirm: () => {
          mutation.mutate({ employeeId: employee.id, newData: formData });
          setPopup(null);
        },
        onCancel: () => {
          onClose();
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("reopenEditBalanceModal", {
                detail: { employee },
              })
            );
          }, 100);
          setPopup(null);
        },
        onClose: () => {
          onClose();
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("reopenEditBalanceModal", {
                detail: { employee },
              })
            );
          }, 100);
          setPopup(null);
        },
      });
    }, 100);
  };

  if (isLoading || !formData)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
        <div className="bg-white p-6 rounded-2xl w-[400px]">
          <LoadingSpinner message="Loading..." />
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
        <div className="bg-white p-6 rounded-2xl w-[400px]">
          <p className="text-red-500">Failed to load leave data.</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
        <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl space-y-6 overflow-hidden">
          <div className="max-h-150 overflow-scroll flex flex-col gap-2">
            <h2 className="subheading-custom-2 mb-2">Edit Leave Balance</h2>
            <p className="body-2 text-[#4A4A4A] mb-4">
              {employee.full_name} — {employee.department}
            </p>

            {Object.entries(formData).map(([type, values]) => (
              <div
                key={type}
                className="border border-[#DFE4EA] rounded-lg p-3 space-y-2"
              >
                <h3 className="body-1 font-semibold">{formatLeaveType(type)}</h3>

                <div className="flex justify-between items-center">
                  <label className="body-2 text-[#4A4A4A]">Remaining</label>
                  <input
                    type="number"
                    value={values?.remaining ?? 0}
                    onChange={(e) =>
                      handleChange(type, "remaining", e.target.value)
                    }
                    className="border border-[#DFE4EA] rounded-lg px-2 py-1 w-[100px]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <label className="body-2 text-[#4A4A4A]">Used</label>
                  <input
                    type="number"
                    value={values?.used ?? 0}
                    onChange={(e) =>
                      handleChange(type, "used", e.target.value)
                    }
                    className="border border-[#DFE4EA] rounded-lg px-2 py-1 w-[100px]"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={onClose}
                className="bg-[#FF4120] text-white rounded-lg px-4 py-2 body-2 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className={`cursor-pointer ${
                  mutation.isPending ? "opacity-60" : ""
                } bg-[#03BC66] text-white rounded-lg px-4 py-2 body-2`}
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
