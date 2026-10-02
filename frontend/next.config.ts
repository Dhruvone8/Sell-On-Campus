import type { NextConfig } from "next";
import os from "os";

function getLocalIpAddresses(): string[] {
  const addresses: string[] = ["localhost", "127.0.0.1", "*.local"];
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
  } catch {
    // fallback to defaults
  }
  return Array.from(new Set(addresses));
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalIpAddresses(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
