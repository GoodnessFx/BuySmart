const OWNER_EMAIL = process.env.NEWSLETTER_OWNER_EMAIL || "kingsleyglory272@gmail.com";
const BREVO_BASE_URL = "https://api.brevo.com/v3";
const SUCCESS_MESSAGE =
  "You’re subscribed. Your email has been saved to the BuySmart newsletter list and the team has been notified.";

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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const message =
      payload?.message ||
      payload?.code ||
      "Brevo request failed while processing the newsletter signup.";
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
  const listId = Number(process.env.BREVO_NEWSLETTER_LIST_ID || "");
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "BuySmart Procurement Limited";

  if (!apiKey || !Number.isFinite(listId) || !senderEmail) {
    return sendJson(res, 500, {
      error:
        "Newsletter signup is not configured yet. Add the Brevo API key, list ID, and sender email in deployment settings.",
    });
  }

  try {
    const body = await readBody(req);
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const consent = body?.consent === true;
    const source = String(body?.source || "website");
    const website = String(body?.website || "").trim();

    if (website) {
      return sendJson(res, 200, { ok: true, message: SUCCESS_MESSAGE });
    }

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { error: "Enter a valid email address." });
    }

    if (!consent) {
      return sendJson(res, 400, { error: "Please confirm newsletter consent before subscribing." });
    }

    await brevoRequest("/contacts", apiKey, {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: {
        SIGNUP_SOURCE: source,
      },
    });

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
      replyTo: {
        email,
      },
      subject: "New BuySmart newsletter subscriber",
      htmlContent: `
        <div style="font-family: Inter, Arial, sans-serif; color: #111111; line-height: 1.6;">
          <h2 style="margin: 0 0 16px;">New newsletter signup</h2>
          <p style="margin: 0 0 12px;">A new subscriber has joined the BuySmart newsletter.</p>
          <div style="margin: 16px 0; padding: 16px; border: 1px solid #E5E2DA; border-radius: 12px; background: #FAFAF8;">
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0;"><strong>Source:</strong> ${source}</p>
          </div>
          <p style="margin: 0;">This contact has also been saved to your Brevo newsletter list for future campaigns.</p>
        </div>
      `,
    });

    return sendJson(res, 200, {
      ok: true,
      message: SUCCESS_MESSAGE,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error:
        error instanceof Error
          ? error.message
          : "Newsletter signup failed. Please try again.",
    });
  }
}
