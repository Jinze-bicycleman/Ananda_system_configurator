/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // jspdf (via fflate) contains a Worker-based code path that Turbopack's
  // server/SSR compiler can't statically bundle ("Can't resolve <dynamic>").
  // It's only ever used client-side (PDF download), so keep it external to
  // the server compilation graph entirely.
  serverExternalPackages: ["jspdf"],
}

export default nextConfig
