/* eslint-disable no-undef */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const { to, employeeName, leaveType, startDate, endDate, status, remarks } = req.body;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  try {
    const subject =
      status === "Approved"
        ? "As-Sufi: Your Leave Request Has Been Approved"
        : "As-Sufi: Your Leave Request Has Been Rejected";

    const html = `
      <div style="font-family: sans-serif;">
        <h2>Leave Request Update</h2>
        <p>Hi ${employeeName},</p>
        <p>Your <b>${leaveType}</b> leave from <b>${startDate}</b> to <b>${endDate}</b>
        has been <b style="color:${status === "Approved" ? "green" : "red"};">${status}</b>.</p>
        ${
          remarks
            ? `<p><b>Remarks:</b> ${remarks}</p>`
            : ""
        }
        <p>– HR Department</p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "HR Department <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: err.message });
  }
}
