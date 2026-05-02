import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.clerk.accounts.dev https://api.minimax.io https://clerk-telemetry.com; img-src 'self' https://img.clerk.com data:;",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;