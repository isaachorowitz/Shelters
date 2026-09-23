/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Headers that vercel.json used to set.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=300, stale-while-revalidate=600" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/leaflet/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=()" },
        ],
      },
    ]
  },
  images: {
    // WebP at three widths only, resized by Cloudflare Images
    formats: ['image/webp'],
    deviceSizes: [640, 1280, 1920],
    imageSizes: [],
    unoptimized: true,
  },
}

export default nextConfig
