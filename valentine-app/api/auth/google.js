import crypto from "node:crypto";

export default function handler(req, res) {
  const state = crypto.randomBytes(16).toString("hex");

  // Determine base URL from request headers
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Set state cookie for CSRF protection
  const isSecure = protocol === "https";
  const cookieFlags = `Path=/; HttpOnly; SameSite=Lax; Max-Age=600${isSecure ? "; Secure" : ""}`;
  res.setHeader("Set-Cookie", `oauth_state=${state}; ${cookieFlags}`);

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  res.redirect(
    302,
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
