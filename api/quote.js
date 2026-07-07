const OWNER_EMAIL =
  process.env.QUOTE_OWNER_EMAIL ||
  process.env.NEWSLETTER_OWNER_EMAIL ||
  "kingsleyglory272@gmail.com";
const BREVO_BASE_URL = "https://api.brevo.com/v3";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

async function brevoRequest(path, apiKey, body) {
  const response = await fetch(`${BREVO_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.code || "Brevo request failed while sending the quote.";
    throw new Error(message);
  }

  return payload;
}

export default async function handler(req, res) {
  res.setHeader("Allow", "POST");

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "BuySmart Procurement Limited";

  if (!apiKey || !senderEmail) {
    return sendJson(res, 500, {
      error:
        "Quote delivery is not configured. Add BREVO_API_KEY and BREVO_SENDER_EMAIL to your deployment settings.",
    });
  }

  try {
    const body = await readBody(req);
    const honeypot = String(body?.honeypot || "").trim();

    if (honeypot) {
      return sendJson(res, 200, { ok: true, message: "Quote request ignored." });
    }

    const htmlContent = `
      <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">New BuySmart quote request</h2>
        <p style="margin: 0 0 12px;">A customer requested a quote through the website contact form.</p>
        <div style="margin: 16px 0; padding: 16px; border: 1px solid #E5E2DA; border-radius: 12px; background: #FAFAF8;">
          <p style="margin: 0 0 8px;"><strong>Name:</strong> ${String(body.name || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Phone Number:</strong> ${String(body.phoneNumber || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>WhatsApp Number:</strong> ${String(body.whatsappNumber || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Product Link / Description:</strong> ${String(body.productLink || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Quantity:</strong> ${String(body.quantity || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Preferred Shipping Method:</strong> ${String(body.preferredShippingMethod || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Preferred Response:</strong> ${String(body.contactPreference || "WhatsApp")}</p>
          <p style="margin: 0 0 8px;"><strong>Product Image Reference:</strong> ${String(body.productImageName || "No image attached")}</p>
          <p style="margin: 0 0 8px;"><strong>Additional Information:</strong> ${String(body.additionalInformation || "Not provided")}</p>
          <p style="margin: 0 0 8px;"><strong>Requested At:</strong> ${String(body.requestedAt || new Date().toISOString())}</p>
        </div>
      </div>
    `;

    await brevoRequest("/smtp/email", apiKey, {
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email: OWNER_EMAIL,
        },
      ],
      subject: "New BuySmart quote request",
      htmlContent,
    });

    return sendJson(res, 200, { ok: true, message: "Quote request delivered to the company inbox." });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Quote request delivery failed.",
    });
  }
}
