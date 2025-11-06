import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployeeTotalLeaves } from "../functions/updateEmployeeTotalLeaves";
import supabase from "../functions/supabase";

// Helper to format leave type names
function formatLeaveType(type) {
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Fetch function for React Query
async function fetchEmployeeLeaves(employeeId) {
  const { data, error } = await supabase
    .from("employees")
    .select("total_leaves")
    .eq("id", employeeId)
    .single();

  if (error) throw new Error(error.message);

  // ✅ Return with proper default structure
  return data?.total_leaves || {
    annualLeave: { remaining: 0, used: 0 },
    medicalLeave: { remaining: 0, used: 0 },
    unpaidLeave: { remaining: 0, used: 0 },
  };
}

export default function EditBalanceModal({ employee, onClose }) {
  const queryClient = useQueryClient();
  
  // ✅ Initialize formData with null and let the query populate it
  const [formData, setFormData] = useState(null);

  // ✅ Fetch total_leaves using React Query
  const { data: leaveData, isLoading, isError } = useQuery({
    queryKey: ["employeeLeaves", employee.id],
    queryFn: () => fetchEmployeeLeaves(employee.id),
  });

  // ✅ Set formData when leaveData is available
  useEffect(() => {
    if (leaveData && !formData) {
      setFormData(leaveData);
    }
  }, [leaveData, formData]);

  // ✅ Mutation for saving updates
  const mutation = useMutation({
    mutationFn: ({ employeeId, newData }) =>
      updateEmployeeTotalLeaves(employeeId, newData),
    onSuccess: () => {
      alert("Leave balance updated successfully!");
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employeeLeaves", employee.id]);
      onClose();
    },
    onError: (err) => {
      console.error("Error updating:", err);
      alert("Failed to update balance.");
    },
  });

  const handleChange = (type, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };

      // Ensure the leave type exists
      if (!updated[type]) {
        updated[type] = { remaining: 0, used: 0 };
      }

      // Update the specific field
      updated[type][field] = Number(value);

      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData) return;
    mutation.mutate({ employeeId: employee.id, newData: formData });
  };

  // ✅ Show loading until formData is populated
  if (isLoading || !formData)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
        <div className="bg-white p-6 rounded-2xl w-[400px]">
          <p>Loading leave data...</p>
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]">
      <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl space-y-6">
        <h2 className="subheading-custom-2 mb-2">Edit Leave Balance</h2>
        <p className="body-2 text-[#4A4A4A] mb-4">
          {employee.full_name} — {employee.department}
        </p>

        {/* Fields */}
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
                onChange={(e) => handleChange(type, "used", e.target.value)}
                className="border border-[#DFE4EA] rounded-lg px-2 py-1 w-[100px]"
              />
            </div>
          </div>
        ))}

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-4">
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
  );
}