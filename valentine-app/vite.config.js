import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import crypto from "node:crypto";

// Dev middleware that replicates the Vercel /api/auth/* serverless functions
function googleAuthDevPlugin(env) {
  return {
    name: "google-auth-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, "http://localhost:5173");

        // GET /api/auth/google — redirect to Google OAuth consent screen
        if (url.pathname === "/api/auth/google") {
          const state = crypto.randomBytes(16).toString("hex");
          const redirectUri = "http://localhost:5173/api/auth/callback/google";

          res.setHeader(
            "Set-Cookie",
            `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
          );

          const params = new URLSearchParams({
            client_id: env.GOOGLE_CLOUD_CLIENT_ID,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            state,
            prompt: "select_account",
          });

          res.writeHead(302, {
            Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
          });
          return res.end();
        }

        // GET /api/auth/callback/google — exchange code for tokens
        if (url.pathname === "/api/auth/callback/google") {
          const code = url.searchParams.get("code");
          const state = url.searchParams.get("state");
          const error = url.searchParams.get("error");

          if (error) {
            res.writeHead(302, {
              Location: `/?auth_error=${encodeURIComponent(error)}`,
            });
            return res.end();
          }

          if (!code) {
            res.writeHead(302, { Location: "/?auth_error=missing_code" });
            return res.end();
          }

          // Verify state cookie
          const cookies = parseCookies(req.headers.cookie || "");
          if (!state || state !== cookies.oauth_state) {
            res.writeHead(302, { Location: "/?auth_error=invalid_state" });
            return res.end();
          }

          const redirectUri = "http://localhost:5173/api/auth/callback/google";

          fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: env.GOOGLE_CLOUD_CLIENT_ID,
              client_secret: env.GOOGLE_CLOUD_CLIENT_SECRET,
              redirect_uri: redirectUri,
              grant_type: "authorization_code",
            }),
          })
            .then((r) => r.json())
            .then((tokens) => {
              const clearCookie = "oauth_state=; Path=/; HttpOnly; Max-Age=0";
              if (tokens.error) {
                res.writeHead(302, {
                  Location: `/?auth_error=${encodeURIComponent(tokens.error_description || tokens.error)}`,
                  "Set-Cookie": clearCookie,
                });
                return res.end();
              }
              res.writeHead(302, {
                Location: `/?google_id_token=${encodeURIComponent(tokens.id_token)}`,
                "Set-Cookie": clearCookie,
              });
              res.end();
            })
            .catch((err) => {
              console.error("Token exchange error:", err);
              res.writeHead(302, {
                Location: "/?auth_error=token_exchange_failed",
              });
              res.end();
            });

          return; // async — don't call next()
        }

        next();
      });
    },
  };
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(";").forEach((c) => {
    const [name, ...rest] = c.trim().split("=");
    if (name) cookies[name] = rest.join("=");
  });
  return cookies;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix loads ALL env vars (including non-VITE_ ones)
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), googleAuthDevPlugin(env)],
  };
});
