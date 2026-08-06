import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,
	output: "standalone",
	cacheComponents: true,
	async redirects() {
		return [
			{
				source: "/player/:username",
				destination: "/player/:username/achievements",
				permanent: true,
			},
		];
	},
	cacheHandlers: {
		remote: require.resolve("./cache-handlers/disk-handler.js"),
	},
	cacheLife: {
		hypixelAchievements: {
			stale: 300,
			revalidate: 86_400,
			expire: 86_400,
		},
		hypixelPlayer: {
			stale: 300,
			revalidate: 300,
			expire: 300,
		},
		hypixelUuid: {
			stale: 300,
			revalidate: 21_600,
			expire: 21_600,
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "mc-heads.net",
				pathname: "/avatar/**",
			},
		],
	},
};

export default nextConfig;
