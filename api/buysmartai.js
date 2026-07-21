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
    const message = payload?.message || payload?.code || "Brevo request failed.";
    throw new Error(message);
  }

  return payload;
}

function generateId() {
  return `BS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export default async function handler(req, res) {
  res.setHeader("Allow", "GET, POST");

  if (req.method === "GET") {
    const identifier = String(req.query?.identifier || "").trim().toLowerCase();

    if (!identifier) {
      return sendJson(res, 400, { error: "Identifier is required." });
    }

    return sendJson(res, 200, { quotes: [] });
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = await readBody(req);

    const quote = {
      id: generateId(),
      name: String(body.name || "").trim(),
      identifier: String(body.identifier || "").trim().toLowerCase(),
      identifierType: body.identifierType === "email" ? "email" : "phone",
      productOrService: String(body.productOrService || "").trim(),
      quantity: String(body.quantity || "").trim(),
      destination: String(body.destination || "").trim(),
      timeline: String(body.timeline || "").trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
      teamNote: "",
    };

    if (!quote.name || !quote.identifier || !quote.productOrService) {
      return sendJson(res, 400, { error: "Name, identifier, and product/service are required." });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "BuySmart Procurement Limited";

    if (apiKey && senderEmail) {
      const htmlContent = `
        <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">New BuySmartAi quote request</h2>
          <p style="margin: 0 0 12px;">A customer submitted a structured quote request through BuySmartAi.</p>
          <div style="margin: 16px 0; padding: 16px; border: 1px solid #E5E2DA; border-radius: 12px; background: #FAFAF8;">
            <p style="margin: 0 0 8px;"><strong>Request ID:</strong> ${quote.id}</p>
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${quote.name}</p>
            <p style="margin: 0 0 8px;"><strong>${quote.identifierType === "email" ? "Email" : "Phone"}:</strong> ${quote.identifier}</p>
            <p style="margin: 0 0 8px;"><strong>Product/Service:</strong> ${quote.productOrService}</p>
            <p style="margin: 0 0 8px;"><strong>Quantity:</strong> ${quote.quantity}</p>
            <p style="margin: 0 0 8px;"><strong>Destination:</strong> ${quote.destination}</p>
            <p style="margin: 0 0 8px;"><strong>Timeline:</strong> ${quote.timeline}</p>
            <p style="margin: 0 0 8px;"><strong>Submitted At:</strong> ${quote.createdAt}</p>
          </div>
          <p style="margin: 0;">Respond to this request by contacting the customer through their provided ${quote.identifierType}.</p>
        </div>
      `;

      await brevoRequest("/smtp/email", apiKey, {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: OWNER_EMAIL }],
        subject: `BuySmartAi Quote Request: ${quote.id}`,
        htmlContent,
      });
    }

    return sendJson(res, 200, { ok: true, quote });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Quote request failed.",
    });
  }
}
