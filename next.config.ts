/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        webpackBuildWorker: false,
    },

    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "13.53.67.23",
                port: "",
                pathname: "/media/**",
            },
        ],
    },

    // Temporary fix for Vercel deployment
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
