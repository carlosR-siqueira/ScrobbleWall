/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
      },
    ],
  },

  // Libera o acesso local (em desenvolvimento) de outros dispositivos na rede
  allowedDevOrigins: ['http://192.168.1.11', 'http://127.0.0.1:3000'],
};

export default nextConfig;
