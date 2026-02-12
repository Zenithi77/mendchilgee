export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(302, `/?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(302, "/?auth_error=missing_code");
  }

  // Verify state (CSRF protection)
  const cookies = parseCookies(req.headers.cookie || "");
  if (!state || state !== cookies.oauth_state) {
    return res.redirect(302, "/?auth_error=invalid_state");
  }

  // Determine base URL from request headers
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  // Clear the state cookie
  const isSecure = protocol === "https";
  const clearCookie = `oauth_state=; Path=/; HttpOnly; Max-Age=0${isSecure ? "; Secure" : ""}`;

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLOUD_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      res.setHeader("Set-Cookie", clearCookie);
      return res.redirect(
        302,
        `/?auth_error=${encodeURIComponent(tokens.error_description || tokens.error)}`,
      );
    }

    // Redirect to frontend with Google ID token for Firebase signInWithCredential
    res.setHeader("Set-Cookie", clearCookie);
    return res.redirect(
      302,
      `/?google_id_token=${encodeURIComponent(tokens.id_token)}`,
    );
  } catch (err) {
    console.error("Token exchange error:", err);
    res.setHeader("Set-Cookie", clearCookie);
    return res.redirect(302, "/?auth_error=token_exchange_failed");
  }
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) cookies[name] = rest.join("=");
  });
  return cookies;
}
