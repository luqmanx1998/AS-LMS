import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee } from "../functions/createEmployee";

function CreateAccModal({ setCreateAccModalIsOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("drivers");
  const [role, setRole] = useState("employee");

  const queryClient = useQueryClient();

  const createEmployeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      // ✅ Invalidate and refetch employee list
      queryClient.invalidateQueries(["employees"]);
      alert("Account created successfully!");
      setCreateAccModalIsOpen(false);
    },
    onError: (err) => {
      console.error("Account creation failed:", err.message);
      alert(`Error: ${err.message}`);
    },
  });

  function handleCreateAccount(e) {
    e.preventDefault();
    createEmployeeMutation.mutate({
      email,
      password,
      full_name: fullName,
      department,
      role,
    });
  }

  return (
    <div className="fixed top-0 left-0 bg-[rgba(0,0,0,0.2)] z-[100] w-full h-full flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl w-[95%] max-w-md shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="subheading-custom-2">Create New Account</h2>
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
            onClick={() => setCreateAccModalIsOpen(false)}
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
            >
              <option value="drivers">Drivers</option>
              <option value="cooks">Cooks</option>
              <option value="management">Management</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createEmployeeMutation.isPending}
            className={`w-full bg-[#EDCEAF] hover:bg-[#e2bea0] text-white font-medium py-2 rounded-lg transition cursor-pointer ${
              createEmployeeMutation.isPending
                ? "opacity-70 cursor-not-allowed"
                : ""
            }`}
          >
            {createEmployeeMutation.isPending ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccModal;
