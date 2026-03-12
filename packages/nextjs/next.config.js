// // @ts-check

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   typescript: {
//     ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
//   },
//   eslint: {
//     ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
//   },
//   webpack: (config) => {
//     config.resolve.fallback = { fs: false, net: false, tls: false };
//     config.externals.push("pino-pretty", "lokijs", "encoding");
//     return config;
//   },
// };

// module.exports = nextConfig;

// module.exports = {
//   experimental: {
//     fontLoaders: [
//       { loader: "@next/font/google", options: { subsets: ["latin"] } },
//     ],
//   },
// };

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.mypinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "**.dweb.link",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;