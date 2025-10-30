export const config = {
  runtime: "nodejs", // ✅ make sure Vercel uses Node runtime
};

/* eslint-disable no-undef */
import { createClient } from "@supabase/supabase-js";

// Create secure Supabase client using service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// helper to always send CORS headers
function send(res, status, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return send(res, 200, {}); // preflight success
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "Method not allowed" });
  }

  try {
    const { id, newPassword } = req.body;

    if (!id || !newPassword) {
      return send(res, 400, { error: "User ID and new password required" });
    }

    // ✅ Admin reset (requires service role)
    const { error } = await supabase.auth.admin.updateUser(id, {
      password: newPassword,
    });

    if (error) throw error;

    console.log(`✅ Password reset for user ${id}`);
    return send(res, 200, { message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Error resetting password:", err.message);
    return send(res, 500, { error: err.message });
  }
}
