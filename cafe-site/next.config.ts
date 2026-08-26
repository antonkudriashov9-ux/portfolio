import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;
