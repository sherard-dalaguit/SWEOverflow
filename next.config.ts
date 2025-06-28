import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ['pino', 'pino-pretty'],
  images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "encrypted-tbn0.gstatic.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				port: "",
			},
			{
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
				port: "",
			},
		],
	},
};

export default nextConfig;
