import { useState } from "react";
import supabase from "../functions/supabase";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query"; // ✅ import this

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ✅ initialize React Query client

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("No user data returned.");
      setLoading(false);
      return;
    }

    // ✅ Fetch their employee record
    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("id", user.id)
      .single();

    if (empError) {
      setError(empError.message);
      setLoading(false);
      return;
    }

    // ✅ Invalidate cache so any future query fetches fresh user data
    queryClient.invalidateQueries(["currentEmployee"]);

    // ✅ Route based on role
    if (employee.role === "admin") {
      navigate("/admin");
    } else if (employee.role === "employee") {
      navigate("/employee");
    } else {
      setError("Unknown role. Please contact admin.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-center mb-6">Login</h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#EDCEAF]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-gray-400" : "bg-[#EDCEAF] hover:bg-[#e2bea0]"
            } text-white font-medium py-2 rounded-lg transition cursor-pointer`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
