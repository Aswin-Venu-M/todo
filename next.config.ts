import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["sequelize", "pg", "pg-hstore", "bcryptjs"],
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
